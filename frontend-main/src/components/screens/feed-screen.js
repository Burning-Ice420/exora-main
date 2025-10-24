"use client"

import { useState, useEffect } from "react"
import { Heart, MessageCircle, Share2, Bookmark, Plus, Search, X, Loader2, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import RecommendationsSidebar from "./recommendations-sidebar"
import RightSidebar from "./right-sidebar"
import ImageUpload from "@/components/ui/image-upload"
import api from "@/server/api"
import { useAuth } from "@/contexts/AuthContext"

export default function FeedScreen() {
  const { user } = useAuth()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [createForm, setCreateForm] = useState({
    caption: '',
    location: '',
    images: []
  })
  const [selectedImages, setSelectedImages] = useState([])

  const [posts, setPosts] = useState([])
  const [showComments, setShowComments] = useState({})
  const [newComment, setNewComment] = useState('')
  const [commentingPost, setCommentingPost] = useState(null)
  const [loading, setLoading] = useState(true)

  // Load feed posts from backend
  useEffect(() => {
    loadFeedPosts()
  }, [])

  const loadFeedPosts = async () => {
    try {
      setLoading(true)
      const response = await api.getFeedPosts()
      if (response.success) {
        setPosts(response.data)
      }
    } catch (error) {
      console.error('Failed to load feed posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleLike = async (id) => {
    try {
      const response = await api.likePost(id)
      if (response.success) {
        setPosts(
          posts.map((post) =>
            post._id === id
              ? {
                  ...post,
                  isLiked: response.data.isLiked,
                  likes: response.data.isLiked 
                    ? [...(post.likes || []), user.id] // Add current user ID to likes
                    : (post.likes || []).filter(likeId => likeId !== user.id) // Remove current user ID from likes
                }
              : post,
          ),
        )
      }
    } catch (error) {
      console.error('Failed to toggle like:', error)
    }
  }

  const toggleSave = (id) => {
    setPosts(posts.map((post) => (post.id === id ? { ...post, saved: !post.saved } : post)))
  }

  const toggleComments = (id) => {
    setShowComments(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const addComment = async (postId) => {
    if (!newComment.trim()) return

    try {
      const response = await api.addComment(postId, newComment.trim())
      if (response.success) {
        // Reload the specific post to get updated comments
        const updatedPosts = posts.map(post => 
          post._id === postId 
            ? { 
                ...post, 
                comments: [...(post.comments || []), response.data.comment],
                commentsCount: response.data.commentsCount
              } 
            : post
        )
        setPosts(updatedPosts)
        setNewComment('')
        setCommentingPost(null)
      }
    } catch (error) {
      console.error('Failed to add comment:', error)
    }
  }

  const handleCommentSubmit = (e, postId) => {
    e.preventDefault()
    addComment(postId)
  }

  const handleImageUpload = async (images) => {
    if (images.length === 0) return

    try {
      setUploading(true)
      const response = await api.uploadFeedImages(images)
      
      if (response.success) {
        setCreateForm({ ...createForm, images: response.data })
        // Clear selected images after successful upload
        setSelectedImages([])
      }
    } catch (error) {
      console.error('Failed to upload images:', error)
      alert('Failed to upload images. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  // Auto-upload when images are selected
  const handleImagesChange = async (images) => {
    setSelectedImages(images)
    
    // Auto-upload if images are selected
    if (images.length > 0) {
      await handleImageUpload(images)
    }
  }

  const handleCreatePost = async () => {
    if (!createForm.caption.trim()) {
      alert('Please add a caption')
      return
    }

    try {
      setUploading(true)
      
      const postData = {
        text: createForm.caption,
        locationTag: createForm.location,
        images: createForm.images
      }

      const response = await api.createFeedPost(postData)
      
      if (response.success) {
        // Reload feed posts to get the new post
        await loadFeedPosts()
        
        // Reset form
        setCreateForm({ caption: '', location: '', images: [] })
        setSelectedImages([])
        setShowCreateModal(false)
      }
    } catch (error) {
      console.error('Failed to create post:', error)
      alert('Failed to create post. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="w-full h-full bg-background flex overflow-hidden">
      {/* Left Sidebar - Desktop Only */}
      <div className="hidden lg:block">
        <RecommendationsSidebar />
      </div>

      {/* Main Feed Area */}
      <div className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="px-4 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Exora</h1>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                <Search size={20} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-primary"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus size={20} />
              </Button>
            </div>
          </div>
        </div>

        {/* Feed Posts - Single Column Layout */}
        <div className="px-4 py-4">
          <div className="max-w-2xl mx-auto space-y-4">
          {loading ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 space-y-4"
            >
              <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center text-4xl">
                <Loader2 className="animate-spin" size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">Loading posts...</h3>
                <p className="text-muted-foreground text-sm">
                  Please wait while we fetch the latest posts
                </p>
              </div>
            </motion.div>
          ) : posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 space-y-4"
            >
              <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center text-4xl">
                📱
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">No posts yet</h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  Be the first to share your travel experiences! Create a post to get started.
                </p>
              </div>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="mt-4"
              >
                <Plus size={16} className="mr-2" />
                Create Your First Post
              </Button>
            </motion.div>
          ) : (
            posts.map((post, idx) => {
              return (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              className="bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-border smooth-transition"
            >
            {/* Post Header */}
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/40 to-primary/20 border-2 border-primary flex items-center justify-center text-lg overflow-hidden">
                  {post.userId?.profileImage?.secureUrl || post.userId?.profileImage?.url ? (
                    <img 
                      src={post.userId.profileImage.secureUrl || post.userId.profileImage.url} 
                      alt={post.userId.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg">👤</span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{post.userId?.name || "Unknown User"}</p>
                  <p className="text-xs text-muted-foreground">{post.locationTag || "Somewhere"}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                <span className="text-lg">⋯</span>
              </Button>
            </div>

            {/* Post Image */}
            {post.images && post.images.length > 0 ? (
              <div className="w-full bg-gradient-to-br from-muted to-background flex items-center justify-center text-6xl relative overflow-hidden">
                <img
                  src={post.images[0].secureUrl || post.images[0].url}
                  alt="Post"
                  className="w-full h-auto max-h-[600px] object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    // Show fallback
                    const fallback = document.createElement('div')
                    fallback.className = 'w-full h-64 flex items-center justify-center text-6xl text-muted-foreground'
                    fallback.innerHTML = '📷'
                    e.target.parentNode.appendChild(fallback)
                  }}
                />
              </div>
            ) : (
              <div className="w-full h-64 bg-gradient-to-br from-muted to-background flex items-center justify-center text-6xl text-muted-foreground">
                📷
              </div>
            )}

            {/* Post Caption */}
            <div className="p-4 space-y-3">
              {post.text && (
                <p className="text-foreground text-sm leading-relaxed">{post.text}</p>
              )}

              {/* Like Count */}
              <div className="text-sm text-muted-foreground font-medium">
                {post.likes?.length || 0} like{(post.likes?.length || 0) !== 1 ? 's' : ''}
                {post.comments?.length > 0 && (
                  <span className="ml-4">
                    {post.comments.length} comment{post.comments.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {/* Interactions */}
              <div className="flex gap-1 pt-3 border-t border-border/50">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleLike(post._id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg smooth-transition ${
                    post.isLiked
                      ? "text-red-500 bg-red-500/10"
                      : "text-muted-foreground hover:text-red-500 hover:bg-red-500/5"
                  }`}
                >
                  <Heart size={18} fill={post.isLiked ? "currentColor" : "none"} />
                  <span className="text-sm font-medium">Like</span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleComments(post._id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg smooth-transition text-muted-foreground hover:text-blue-500 hover:bg-blue-500/5"
                >
                  <MessageCircle size={18} />
                  <span className="text-sm font-medium">Comment</span>
                </motion.button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-muted-foreground hover:text-green-500 hover:bg-green-500/5 smooth-transition"
                >
                  <Share2 size={18} className="mr-2" />
                  <span className="text-sm">Share</span>
                </Button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleSave(post._id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg smooth-transition ${
                    post.saved
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  <Bookmark size={18} fill={post.saved ? "currentColor" : "none"} />
                  <span className="text-sm font-medium">Save</span>
                </motion.button>
              </div>

              {/* Comments Section */}
              {showComments[post._id] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-border/50 pt-4 space-y-3"
                >
                  {/* Existing Comments */}
                  {post.comments && post.comments.length > 0 && (
                    <div className="space-y-3">
                      {post.comments.map((comment, index) => (
                        <div key={comment._id || `comment-${index}-${comment.timestamp}`} className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/40 to-primary/20 border border-primary flex items-center justify-center text-sm overflow-hidden flex-shrink-0">
                            {comment.userId?.profileImage?.secureUrl || comment.userId?.profileImage?.url ? (
                              <img 
                                src={comment.userId.profileImage.secureUrl || comment.userId.profileImage.url} 
                                alt={comment.userId.name} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              "👤"
                            )}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">{comment.userId?.name || "Unknown"}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(comment.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-foreground">{comment.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Comment Form */}
                  <form onSubmit={(e) => handleCommentSubmit(e, post._id)} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/40 to-primary/20 border border-primary flex items-center justify-center text-sm overflow-hidden flex-shrink-0">
                      {user?.profileImage?.secureUrl || user?.profileImage?.url ? (
                        <img 
                          src={user.profileImage.secureUrl || user.profileImage.url} 
                          alt={user.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        "👤"
                      )}
                    </div>
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      />
                      <Button
                        type="submit"
                        size="sm"
                        disabled={!newComment.trim()}
                        className="px-4"
                      >
                        Post
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}
            </div>
          </motion.div>
              )
            })
          )}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Desktop Only */}
      <div className="hidden lg:block">
        <RightSidebar />
      </div>

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-background rounded-2xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-xl font-bold text-foreground">Create Post</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCreateModal(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X size={18} />
                </Button>
              </div>

              {/* Modal Content */}
              <div className="p-4 space-y-6">
                {/* Image Upload */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Add Photos</h3>
                  <ImageUpload
                    onImagesChange={handleImagesChange}
                    maxImages={10}
                    maxSize={5}
                    placeholder="Upload photos for your post"
                    uploading={uploading}
                  />
                  
                  {/* Show upload status */}
                  {uploading && (
                    <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <p className="text-sm text-blue-600 font-medium flex items-center">
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Uploading images...
                      </p>
                    </div>
                  )}
                  
                  {createForm.images.length > 0 && !uploading && (
                    <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <p className="text-sm text-green-600 font-medium">
                        ✅ {createForm.images.length} image{createForm.images.length > 1 ? 's' : ''} uploaded successfully
                      </p>
                    </div>
                  )}
                </div>

                {/* Caption */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Caption</label>
                  <textarea
                    value={createForm.caption}
                    onChange={(e) => setCreateForm({ ...createForm, caption: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    rows={4}
                    placeholder="What's on your mind? Share your travel experience..."
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Location (Optional)</label>
                  <input
                    type="text"
                    value={createForm.location}
                    onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Where was this taken?"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 p-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePost}
                  disabled={uploading || !createForm.caption.trim()}
                  className="flex-1"
                >
                  {uploading ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Post'
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
