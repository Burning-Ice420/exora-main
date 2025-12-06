import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import * as ImagePicker from "expo-image-picker";

export default function FeedScreen() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [createForm, setCreateForm] = useState({
    caption: "",
    location: "",
    images: [] as string[],
  });
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [newComment, setNewComment] = useState("");
  const [commentingPost, setCommentingPost] = useState<string | null>(null);

  useEffect(() => {
    loadFeedPosts();
  }, []);

  const loadFeedPosts = async () => {
    try {
      setLoading(true);
      const response = await api.getFeedPosts();
      if (response.success) {
        setPosts(response.data || []);
      }
    } catch (error) {
      console.error("Failed to load feed posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (postId: string) => {
    try {
      const response = await api.likePost(postId);
      if (response.success) {
        setPosts(
          posts.map((post) =>
            post._id === postId
              ? {
                  ...post,
                  isLiked: response.data.isLiked,
                  likes: response.data.isLiked
                    ? [...(post.likes || []), user?._id]
                    : (post.likes || []).filter(
                        (likeId: string) => likeId !== user?._id
                      ),
                }
              : post
          )
        );
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  const addComment = async (postId: string) => {
    if (!newComment.trim()) return;

    try {
      const response = await api.addComment(postId, newComment.trim());
      if (response.success) {
        const updatedPosts = posts.map((post) =>
          post._id === postId
            ? {
                ...post,
                comments: [...(post.comments || []), response.data.comment],
                commentsCount: response.data.commentsCount,
              }
            : post
        );
        setPosts(updatedPosts);
        setNewComment("");
        setCommentingPost(null);
      }
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleImageUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      setUploading(true);
      try {
        const imageUris = result.assets.map((asset) => asset.uri);
        setSelectedImages(imageUris);
        const response = await api.uploadFeedImages(imageUris);
        // Backend returns: { success: true, data: imagesData[] }
        // API client normalizes to: { images: imagesData[] }
        const images = response.images || response.data || [];
        if (images.length > 0) {
          setCreateForm({ ...createForm, images });
        }
      } catch (error: any) {
        console.error("Failed to upload images:", error);
        Alert.alert(
          "Error",
          error.message || "Failed to upload images. Please try again."
        );
      } finally {
        setUploading(false);
      }
    }
  };

  const handleCreatePost = async () => {
    if (!createForm.caption.trim()) {
      Alert.alert("Error", "Please add a caption");
      return;
    }

    try {
      setUploading(true);
      const postData = {
        text: createForm.caption,
        locationTag: createForm.location,
        images: createForm.images,
      };

      const response = await api.createFeedPost(postData);
      if (response.success) {
        await loadFeedPosts();
        setCreateForm({ caption: "", location: "", images: [] });
        setSelectedImages([]);
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error("Failed to create post:", error);
      Alert.alert("Error", "Failed to create post. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>exora</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="search" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Feed */}
      <ScrollView
        style={styles.feed}
        contentContainerStyle={styles.feedContent}
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading posts...</Text>
          </View>
        ) : posts.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyEmoji}>📱</Text>
            <Text style={styles.emptyTitle}>No posts yet</Text>
            <Text style={styles.emptyText}>
              Be the first to share your travel experiences!
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.createButtonText}>
                Create Your First Post
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          posts.map((post) => (
            <View key={post._id} style={styles.postCard}>
              {/* Post Header */}
              <View style={styles.postHeader}>
                <View style={styles.userInfo}>
                  <Image
                    source={{
                      uri:
                        post.userId?.profileImage?.secureUrl ||
                        post.userId?.profileImage?.url ||
                        "https://via.placeholder.com/40",
                    }}
                    style={styles.avatar}
                  />
                  <View>
                    <Text style={styles.userName}>
                      {post.userId?.name || "Unknown User"}
                    </Text>
                    <Text style={styles.location}>
                      {post.locationTag || "Somewhere"}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity>
                  <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Post Image */}
              {post.images && post.images.length > 0 && (
                <Image
                  source={{
                    uri:
                      post.images[0]?.secureUrl ||
                      post.images[0]?.url ||
                      post.images[0] ||
                      "https://via.placeholder.com/400",
                  }}
                  style={styles.postImage}
                  resizeMode="cover"
                />
              )}

              {/* Post Actions */}
              <View style={styles.postActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => toggleLike(post._id)}
                >
                  <Ionicons
                    name={post.isLiked ? "heart" : "heart-outline"}
                    size={24}
                    color={post.isLiked ? "#FF3B30" : "#000"}
                  />
                  <Text style={styles.actionCount}>
                    {post.likes?.length || 0}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() =>
                    setShowComments({
                      ...showComments,
                      [post._id]: !showComments[post._id],
                    })
                  }
                >
                  <Ionicons name="chatbubble-outline" size={24} color="#000" />
                  <Text style={styles.actionCount}>
                    {post.commentsCount || post.comments?.length || 0}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="share-outline" size={24} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="bookmark-outline" size={24} color="#000" />
                </TouchableOpacity>
              </View>

              {/* Post Caption */}
              <View style={styles.postCaption}>
                <Text style={styles.captionText}>
                  <Text style={styles.captionUser}>
                    {post.userId?.name || "Unknown"}
                  </Text>{" "}
                  {post.text || post.caption}
                </Text>
              </View>

              {/* Comments */}
              {showComments[post._id] && (
                <View style={styles.commentsSection}>
                  {post.comments
                    ?.slice(0, 3)
                    .map((comment: any, idx: number) => (
                      <View key={idx} style={styles.comment}>
                        <Text style={styles.commentText}>
                          <Text style={styles.commentUser}>
                            {comment.userId?.name || "Unknown"}
                          </Text>{" "}
                          {comment.text}
                        </Text>
                      </View>
                    ))}
                  {post.commentsCount > 3 && (
                    <Text style={styles.viewMoreComments}>
                      View all {post.commentsCount} comments
                    </Text>
                  )}
                  <View style={styles.commentInput}>
                    <TextInput
                      style={styles.commentTextInput}
                      placeholder="Add a comment..."
                      value={commentingPost === post._id ? newComment : ""}
                      onChangeText={setNewComment}
                      onSubmitEditing={() => addComment(post._id)}
                    />
                    <TouchableOpacity onPress={() => addComment(post._id)}>
                      <Ionicons name="send" size={20} color="#007AFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Create Post Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Post</Text>
            <TouchableOpacity
              onPress={handleCreatePost}
              disabled={uploading || !createForm.caption.trim()}
            >
              <Text
                style={[
                  styles.modalPost,
                  (!createForm.caption.trim() || uploading) &&
                    styles.modalPostDisabled,
                ]}
              >
                Post
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <TextInput
              style={styles.captionInput}
              placeholder="Write a caption..."
              multiline
              value={createForm.caption}
              onChangeText={(text) =>
                setCreateForm({ ...createForm, caption: text })
              }
            />
            <TextInput
              style={styles.locationInput}
              placeholder="Add location (optional)"
              value={createForm.location}
              onChangeText={(text) =>
                setCreateForm({ ...createForm, location: text })
              }
            />
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleImageUpload}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color="#007AFF" />
              ) : (
                <>
                  <Ionicons name="image-outline" size={24} color="#007AFF" />
                  <Text style={styles.uploadButtonText}>
                    {selectedImages.length > 0
                      ? `${selectedImages.length} image(s) selected`
                      : "Add Photos"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
            {selectedImages.length > 0 && (
              <ScrollView horizontal style={styles.imagePreview}>
                {selectedImages.map((uri, idx) => (
                  <Image
                    key={idx}
                    source={{ uri }}
                    style={styles.previewImage}
                  />
                ))}
              </ScrollView>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  headerActions: {
    flexDirection: "row",
    gap: 16,
  },
  headerButton: {
    padding: 4,
  },
  feed: {
    flex: 1,
  },
  feedContent: {
    paddingBottom: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  postCard: {
    backgroundColor: "#fff",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    paddingBottom: 16,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  location: {
    fontSize: 12,
    color: "#666",
  },
  postImage: {
    width: "100%",
    height: 400,
    backgroundColor: "#F5F5F5",
  },
  postActions: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionCount: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
  },
  postCaption: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  captionText: {
    fontSize: 14,
    color: "#000",
  },
  captionUser: {
    fontWeight: "600",
  },
  commentsSection: {
    paddingHorizontal: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
  },
  comment: {
    marginBottom: 8,
  },
  commentText: {
    fontSize: 14,
    color: "#000",
  },
  commentUser: {
    fontWeight: "600",
  },
  viewMoreComments: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  commentInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  commentTextInput: {
    flex: 1,
    fontSize: 14,
    color: "#000",
    paddingVertical: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  modalCancel: {
    fontSize: 16,
    color: "#666",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  modalPost: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  modalPostDisabled: {
    opacity: 0.5,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  captionInput: {
    fontSize: 16,
    color: "#000",
    minHeight: 100,
    marginBottom: 16,
  },
  locationInput: {
    fontSize: 14,
    color: "#000",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    marginBottom: 16,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 16,
    borderWidth: 2,
    borderColor: "#007AFF",
    borderStyle: "dashed",
    borderRadius: 12,
    justifyContent: "center",
  },
  uploadButtonText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "500",
  },
  imagePreview: {
    marginTop: 16,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
  },
});
