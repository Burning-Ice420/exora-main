"use client"

import { useState, useEffect } from "react"
import { Heart, MessageCircle, Share2, Bookmark, Plus, Search, X, Loader2, Image as ImageIcon, Calendar, MapPin, Users, Plane, Settings, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import RecommendationsSidebar from "./recommendations-sidebar"
import RightSidebar from "./right-sidebar"
import ImageUpload from "@/components/ui/image-upload"
import TripJoinModal from "@/components/ui/trip-join-modal"
import api from "@/server/api"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/toast"

export default function FeedScreen() {
  const { user } = useAuth()
  const router = useRouter()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [postType, setPostType] = useState('Post') // 'Post' or 'Trip'
  const [userTrips, setUserTrips] = useState([])
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [loadingTrips, setLoadingTrips] = useState(false)
  const [createForm, setCreateForm] = useState({
    caption: '',
    location: '',
    images: [],
    // Trip post fields
    tripDate: '',
    tripCapacity: '',
    tripLocation: '',
    tripCoordinates: null
  })
  const [selectedImages, setSelectedImages] = useState([])
  const [posts, setPosts] = useState([])
  const [showComments, setShowComments] = useState({})
  const [newComment, setNewComment] = useState('')
  const [commentingPost, setCommentingPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [selectedTripForJoin, setSelectedTripForJoin] = useState(null)
  const [loadingTrip, setLoadingTrip] = useState(false)
  const { success, error } = useToast()

  // Load feed posts from backend
  useEffect(() => {
    loadFeedPosts()
  }, [])

  // Load user's trips when modal opens and trip type is selected
  useEffect(() => {
    if (showCreateModal && postType === 'Trip') {
      loadUserTrips()
    }
  }, [showCreateModal, postType])

  const loadUserTrips = async () => {
    try {
      setLoadingTrips(true)
      const response = await api.getTrips()
      const trips = response?.trips || response || []
      setUserTrips(trips)
    } catch (error) {
      console.error('Failed to load trips:', error)
      setUserTrips([])
    } finally {
      setLoadingTrips(false)
    }
  }

  const handleTripSelect = (tripId) => {
    const trip = userTrips.find(t => (t._id || t.id) === tripId)
    if (trip) {
      setSelectedTrip(trip)
      // Pre-fill form with trip data
      setCreateForm({
        ...createForm,
        caption: createForm.caption || `Join me on ${trip.name}! Exploring ${trip.location || trip.destination} from ${new Date(trip.startDate).toLocaleDateString()} to ${new Date(trip.endDate).toLocaleDateString()}.`,
        location: trip.location || trip.destination || '',
        tripDate: trip.startDate ? new Date(trip.startDate).toISOString().split('T')[0] : '',
        tripCapacity: '10', // Default capacity
        tripLocation: trip.location || trip.destination || '',
        tripCoordinates: trip.startCoordinates || null
      })
    }
  }

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

    // Validate trip post fields
    if (postType === 'Trip') {
      if (!selectedTrip) {
        alert('Please select a trip to post')
        return
      }
      if (!createForm.tripCapacity) {
        alert('Please set the capacity (how many people can join)')
        return
      }
    }

    try {
      setUploading(true)
      
      const postData = {
        text: createForm.caption,
        locationTag: createForm.location || createForm.tripLocation,
        images: createForm.images,
        type: postType
      }

      // Add trip post specific fields
      if (postType === 'Trip' && selectedTrip) {
        const tripId = selectedTrip._id || selectedTrip.id
        postData.tripPost = {
          tripId: tripId,
          date: new Date(selectedTrip.startDate),
          capacity: parseInt(createForm.tripCapacity) || 10,
          location: selectedTrip.location || selectedTrip.destination,
          coordinates: selectedTrip.startCoordinates || createForm.tripCoordinates || null,
          joinable: true
        }
      }

      const response = postType === 'Trip' 
        ? await api.createTripPost(postData)
        : await api.createFeedPost(postData)
      
      if (response.success) {
        // Reload feed posts to get the new post
        await loadFeedPosts()
        
        // Reset form
        setCreateForm({ 
          caption: '', 
          location: '', 
          images: [],
          tripDate: '',
          tripCapacity: '',
          tripLocation: '',
          tripCoordinates: null
        })
        setSelectedImages([])
        setSelectedTrip(null)
        setPostType('Post')
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
      <div className="flex-1 overflow-y-auto pb-20 lg:pb-24 scrollbar-hide">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-border/30 bg-background/95 backdrop-blur-md shadow-sm">
          <div className="px-3 lg:px-4 py-3 lg:py-4 flex items-center justify-between">
            <h1 className="text-xl lg:text-2xl font-bold text-foreground">exora</h1>
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
        <div className="px-3 lg:px-4 py-3 lg:py-4">
          <div className="max-w-2xl mx-auto space-y-3 lg:space-y-4">
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
              className="bg-card rounded-xl lg:rounded-2xl overflow-hidden border border-border/50 hover:border-primary/30 hover:shadow-md smooth-transition"
            >
            {/* Post Header */}
            <div className="p-3 lg:p-4 border-b border-border/50 flex items-center justify-between">
              <div 
                className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 rounded-lg p-2 -m-2 smooth-transition"
                onClick={() => {
                  if (post.userId?._id) {
                    // If it's the current user's own post, redirect to profile page
                    if (post.userId._id === user?._id) {
                      router.push('/profile')
                    } else {
                      router.push(`/user/${post.userId._id}`)
                    }
                  }
                }}
              >
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
                  <p className="font-semibold text-foreground text-sm hover:text-primary smooth-transition">{post.userId?.name || "Unknown User"}</p>
                  <p className="text-xs text-muted-foreground">{post.locationTag || "Somewhere"}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                <span className="text-lg">⋯</span>
              </Button>
            </div>

            {/* Trip Post Details */}
            {post.type === 'Trip' && post.tripPost && (
              <div className="p-3 lg:p-4 bg-primary/5 border-b border-border/50">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Plane size={20} className="text-primary" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-foreground">
                        <Calendar size={14} className="text-muted-foreground" />
                        <span>{new Date(post.tripPost.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-foreground">
                        <Users size={14} className="text-muted-foreground" />
                        <span>{post.tripPost.capacity} spots</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-foreground">
                        <MapPin size={14} className="text-muted-foreground" />
                        <span>{post.tripPost.location}</span>
                      </div>
                    </div>
                    {/* Check if current user is the trip owner */}
                    {post.userId?._id === user?._id ? (
                      <Button
                        onClick={() => {
                          // Owner: Navigate to labs to manage trip
                          if (post.tripPost?.tripId) {
                            router.push(`/labs?tripId=${post.tripPost.tripId}`)
                          } else {
                            router.push('/labs')
                          }
                        }}
                        variant="outline"
                        className="w-full mt-2"
                        size="sm"
                      >
                        <Settings size={14} className="mr-2" />
                        Manage Trip
                      </Button>
                    ) : (
                      <Button
                        onClick={async () => {
                          // Non-owner: Open join modal
                          if (!post.tripPost?.tripId) {
                            error('Trip Not Found', 'This trip is not available to join')
                            return
                          }
                          
                          try {
                            setLoadingTrip(true)
                            
                            // Check if tripId exists
                            if (!post.tripPost?.tripId) {
                              error('Trip Not Found', 'This trip post does not have a valid trip ID')
                              return
                            }
                            
                            // Fetch trip directly by ID
                            const response = await api.getTripById(post.tripPost.tripId)
                            
                            if (response.status === 'success' && response.trip) {
                              setSelectedTripForJoin(response.trip)
                              setShowJoinModal(true)
                            } else {
                              throw new Error('Trip not found in response')
                            }
                          } catch (err) {
                            console.error('Failed to load trip:', err)
                            const errorMessage = err.message || 'Failed to load trip details'
                            
                            // If tripId exists but trip not found, show specific error
                            if (post.tripPost?.tripId && errorMessage.includes('not found')) {
                              error('Trip Not Found', 'This trip is no longer available or has been removed')
                            } else if (errorMessage.includes('not accessible')) {
                              error('Access Denied', 'This trip is private and not available to join')
                            } else {
                              // Fallback: create trip object from post data for join modal
                              const tripFromPost = {
                                _id: post.tripPost.tripId,
                                name: post.text?.split('!')[0]?.replace('Join me on ', '') || 'Trip',
                                location: post.tripPost.location,
                                destination: post.tripPost.location,
                                startDate: post.tripPost.date,
                                endDate: post.tripPost.date,
                                itinerary: [],
                                createdBy: post.userId?._id || post.userId
                              }
                              setSelectedTripForJoin(tripFromPost)
                              setShowJoinModal(true)
                            }
                          } finally {
                            setLoadingTrip(false)
                          }
                        }}
                        disabled={loadingTrip}
                        className="w-full mt-2"
                        size="sm"
                      >
                        {loadingTrip ? (
                          <>
                            <Loader2 size={14} className="mr-2 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <Plane size={14} className="mr-2" />
                            Join Trip
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

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
            <div className="p-3 lg:p-4 space-y-2 lg:space-y-3">
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
              <div className="flex gap-1 lg:gap-2 pt-2 lg:pt-3 border-t border-border/50">
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
                  <span className="text-xs lg:text-sm font-medium hidden sm:inline">Like</span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleComments(post._id)}
                  className="flex-1 flex items-center justify-center gap-1 lg:gap-2 py-2 rounded-lg smooth-transition text-muted-foreground hover:text-blue-500 hover:bg-blue-500/5"
                >
                  <MessageCircle size={18} />
                  <span className="text-xs lg:text-sm font-medium hidden sm:inline">Comment</span>
                </motion.button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-muted-foreground hover:text-green-500 hover:bg-green-500/5 smooth-transition"
                >
                  <Share2 size={18} className="sm:mr-2" />
                  <span className="text-xs lg:text-sm hidden sm:inline">Share</span>
                </Button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleSave(post._id)}
                  className={`flex-1 flex items-center justify-center gap-1 lg:gap-2 py-2 rounded-lg smooth-transition ${
                    post.saved
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  <Bookmark size={18} fill={post.saved ? "currentColor" : "none"} />
                  <span className="text-xs lg:text-sm font-medium hidden sm:inline">Save</span>
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
                          <div 
                            className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/40 to-primary/20 border border-primary flex items-center justify-center text-sm overflow-hidden flex-shrink-0 cursor-pointer hover:scale-105 smooth-transition"
                            onClick={() => {
                              if (comment.userId?._id) {
                                // If it's the current user's own comment, redirect to profile page
                                if (comment.userId._id === user?._id) {
                                  router.push('/profile')
                                } else {
                                  router.push(`/user/${comment.userId._id}`)
                                }
                              }
                            }}
                          >
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
                              <span 
                                className="text-sm font-semibold text-foreground cursor-pointer hover:text-primary smooth-transition"
                                onClick={() => {
                                  if (comment.userId?._id) {
                                    // If it's the current user's own comment, redirect to profile page
                                    if (comment.userId._id === user?._id) {
                                      router.push('/profile')
                                    } else {
                                      router.push(`/user/${comment.userId._id}`)
                                    }
                                  }
                                }}
                              >
                                {comment.userId?.name || "Unknown"}
                              </span>
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
        <RightSidebar onCreatePost={() => setShowCreateModal(true)} />
      </div>

      {/* Create Post Modal */}
      <AnimatePresence mode="wait">
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-2 lg:p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowCreateModal(false)
                setPostType('Post')
                setSelectedTrip(null)
                setCreateForm({
                  caption: '',
                  location: '',
                  images: [],
                  tripDate: '',
                  tripCapacity: '',
                  tripLocation: '',
                  tripCoordinates: null
                })
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                duration: 0.4
              }}
              className="bg-card rounded-lg border border-border/40 shadow-xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.2 }}
                className="flex items-center justify-between px-4 py-3 border-b border-border/40"
              >
                <h2 className="text-lg font-semibold text-foreground">Create Post</h2>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => {
                    setShowCreateModal(false)
                    setPostType('Post')
                    setSelectedTrip(null)
                    setCreateForm({
                      caption: '',
                      location: '',
                      images: [],
                      tripDate: '',
                      tripCapacity: '',
                      tripLocation: '',
                      tripCoordinates: null
                    })
                  }}
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                >
                  <X size={16} />
                </Button>
              </motion.div>

              {/* Post Type Selector */}
              <div className="px-4 py-2.5 border-b border-border/40">
                <div className="relative flex gap-1 bg-muted/50 p-0.5 rounded-lg">
                  <motion.div
                    className="absolute inset-y-0.5 left-0.5 bg-card rounded-md shadow-sm"
                    initial={false}
                    animate={{
                      x: postType === 'Post' ? 0 : 'calc(100% - 0.25rem)',
                      width: 'calc(50% - 0.25rem)'
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                  <Button
                    variant={postType === 'Post' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setPostType('Post')}
                    className="flex-1 relative z-10 h-8 text-xs"
                  >
                    Post
                  </Button>
                  <Button
                    variant={postType === 'Trip' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setPostType('Trip')}
                    className="flex-1 relative z-10 h-8 text-xs"
                  >
                    <Plane size={14} className="mr-1.5" />
                    Trip
                  </Button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-4">
                  {/* Image Upload */}
                  <div className="space-y-2">
                    <ImageUpload
                      onImagesChange={handleImagesChange}
                      maxImages={10}
                      maxSize={5}
                      placeholder="Add photos"
                      uploading={uploading}
                    />
                  </div>

                  {/* Caption */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-foreground">Caption</label>
                      <span className="text-xs text-muted-foreground">{createForm.caption.length}/500</span>
                    </div>
                    <textarea
                      value={createForm.caption}
                      onChange={(e) => {
                        if (e.target.value.length <= 500) {
                          setCreateForm({ ...createForm, caption: e.target.value })
                        }
                      }}
                      className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all resize-none"
                      rows={3}
                      placeholder="What's on your mind?"
                    />
                  </div>

                  {/* Location */}
                  {postType === 'Post' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                        <MapPin size={12} className="text-muted-foreground" />
                        Location <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={createForm.location}
                        onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                        className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
                        placeholder="Where was this taken?"
                      />
                    </div>
                  )}

                  {/* Trip Post Fields */}
                  {postType === 'Trip' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-3 p-3 bg-primary/5 border border-primary/20 rounded-lg"
                    >
                    
                      {/* Trip Selector */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                          <Plane size={12} />
                          Select Trip <span className="text-red-500">*</span>
                        </label>
                        {loadingTrips ? (
                          <div className="flex items-center justify-center py-3">
                            <Loader2 size={16} className="animate-spin text-primary" />
                            <span className="ml-2 text-xs text-muted-foreground">Loading...</span>
                          </div>
                        ) : userTrips.length === 0 ? (
                          <div className="p-3 bg-muted/50 rounded-lg border border-border text-center">
                            <p className="text-xs text-muted-foreground mb-2">No trips found</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push('/labs')}
                              className="text-xs h-7"
                            >
                              Create Trip
                            </Button>
                          </div>
                        ) : (
                          <select
                            value={selectedTrip ? (selectedTrip._id || selectedTrip.id) : ''}
                            onChange={(e) => handleTripSelect(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            required
                          >
                            <option value="">Select a trip...</option>
                            {userTrips.map((trip) => (
                              <option key={trip._id || trip.id} value={trip._id || trip.id}>
                                {trip.name} - {trip.location || trip.destination}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      {/* Selected Trip Details */}
                      {selectedTrip && (
                        <div className="p-2 bg-background rounded-lg border border-border space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs text-foreground">
                            <MapPin size={11} className="text-muted-foreground" />
                            <span className="font-medium">{selectedTrip.location || selectedTrip.destination}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Calendar size={11} />
                            <span>
                              {new Date(selectedTrip.startDate).toLocaleDateString()} - {new Date(selectedTrip.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Capacity Input */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                          <Users size={12} />
                          Capacity <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={createForm.tripCapacity}
                          onChange={(e) => setCreateForm({ ...createForm, tripCapacity: e.target.value })}
                          min="1"
                          max="50"
                          className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          placeholder="How many people?"
                          required
                        />
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-2 px-4 py-3 border-t border-border/40">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false)
                    setPostType('Post')
                    setSelectedTrip(null)
                    setCreateForm({
                      caption: '',
                      location: '',
                      images: [],
                      tripDate: '',
                      tripCapacity: '',
                      tripLocation: '',
                      tripCoordinates: null
                    })
                  }}
                  className="flex-1 h-9 text-sm"
                  disabled={uploading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePost}
                  disabled={uploading || !createForm.caption.trim()}
                  className="flex-1 h-9 text-sm"
                >
                  {uploading ? (
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader2 size={14} />
                      </motion.div>
                      <span>Creating...</span>
                    </div>
                  ) : (
                    'Create Post'
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trip Join Modal */}
      <TripJoinModal
        isOpen={showJoinModal}
        onClose={() => {
          setShowJoinModal(false)
          setSelectedTripForJoin(null)
        }}
        trip={selectedTripForJoin}
        onSuccess={(request) => {
          success('Request Sent', 'Your join request has been sent!')
          setShowJoinModal(false)
          setSelectedTripForJoin(null)
        }}
      />
    </div>
  )
}
