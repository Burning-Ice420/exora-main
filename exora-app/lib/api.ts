// API layer for all backend communication
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

const API_BASE_URL =
  Constants.expoConfig?.extra?.apiUrl ||
  process.env.EXPO_PUBLIC_API_URL ||
  "https://api.exora.in";

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic request method
  async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    const token = await this.getToken();

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        // Handle 401 Unauthorized specifically
        if (response.status === 401) {
          await this.removeToken();
          throw new Error(
            data.message || "Authentication failed. Please login again."
          );
        }

        // Backend returns errors in format: { status: 'error', message: '...' }
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      // Backend returns success in format: { status: 'success', ... }
      return data;
    } catch (error: any) {
      console.error("API request failed:", error);
      // If it's already an Error object, throw it as is
      if (error instanceof Error) {
        throw error;
      }
      // Otherwise wrap it
      throw new Error(error.message || "An unexpected error occurred");
    }
  }

  // Token management using SecureStore
  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync("authToken");
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  }

  async setToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync("authToken", token);
    } catch (error) {
      console.error("Error setting token:", error);
    }
  }

  async removeToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync("authToken");
    } catch (error) {
      console.error("Error removing token:", error);
    }
  }

  // Authentication endpoints
  async login(email: string, password: string) {
    const response = await this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (response && response.token) {
      await this.setToken(response.token);
    }

    return response;
  }

  async register(userData: any) {
    const response = await this.request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    if (response && response.token) {
      await this.setToken(response.token);
    }

    return response;
  }

  async logout() {
    try {
      await this.request("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      await this.removeToken();
    }
  }

  async getCurrentUser() {
    return await this.request("/api/auth/me");
  }

  async getUserById(userId: string) {
    return await this.request(`/api/users/${userId}`);
  }

  async updateProfile(userData: any) {
    return await this.request("/api/auth/profile", {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  }

  // User preferences
  async updatePreferences(preferences: any) {
    return await this.request("/api/user/preferences", {
      method: "PUT",
      body: JSON.stringify({ preferences }),
    });
  }

  // Travel experiences
  async getExperiences(filters: any = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return await this.request(`/api/experiences?${queryParams}`);
  }

  async createExperience(experienceData: any) {
    return await this.request("/api/experiences", {
      method: "POST",
      body: JSON.stringify(experienceData),
    });
  }

  async joinExperience(experienceId: string) {
    return await this.request(`/api/experiences/${experienceId}/join`, {
      method: "POST",
    });
  }

  // Trips
  async getTrips() {
    return await this.request("/api/trips");
  }

  async getPublicTrips() {
    return await this.request("/api/trips/public");
  }

  async createTrip(tripData: any) {
    return await this.request("/api/trips", {
      method: "POST",
      body: JSON.stringify(tripData),
    });
  }

  async updateTrip(tripId: string, tripData: any) {
    return await this.request(`/api/trips/${tripId}`, {
      method: "PUT",
      body: JSON.stringify(tripData),
    });
  }

  // Feed/Posts
  async getFeed(page: number = 1, limit: number = 10) {
    return await this.request(`/api/feed?page=${page}&limit=${limit}`);
  }

  async createPost(postData: any) {
    return await this.request("/api/feed", {
      method: "POST",
      body: JSON.stringify(postData),
    });
  }

  async likePost(postId: string) {
    return await this.request(`/api/feed/${postId}/like`, {
      method: "POST",
    });
  }

  // Connections
  async getConnections() {
    return await this.request("/api/connections");
  }

  async sendConnectionRequest(userId: string) {
    return await this.request(`/api/connections/${userId}/request`, {
      method: "POST",
    });
  }

  async acceptConnectionRequest(connectionId: string) {
    return await this.request(`/api/connections/${connectionId}/accept`, {
      method: "POST",
    });
  }

  async rejectConnectionRequest(connectionId: string) {
    return await this.request(`/api/connections/${connectionId}/reject`, {
      method: "POST",
    });
  }

  // Image upload endpoints
  async uploadProfileImage(imageUri: string) {
    const token = await this.getToken();
    const formData = new FormData();

    // @ts-ignore
    formData.append("image", {
      uri: imageUri,
      type: "image/jpeg",
      name: "profile.jpg",
    } as any);

    const response = await fetch(`${this.baseURL}/api/uploads/profile`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type for FormData, let the browser set it with boundary
      },
      body: formData,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Failed to upload profile image");
    }

    // Backend returns: { success: true, message: '...', data: imageData }
    // Return in format expected by components: { image: imageData }
    if (data.success && data.data) {
      return { image: data.data };
    }

    // Fallback for different response formats
    return data;
  }

  async uploadFeedImages(imageUris: string[]) {
    const token = await this.getToken();
    const formData = new FormData();

    imageUris.forEach((uri, index) => {
      // @ts-ignore
      formData.append("images", {
        uri,
        type: "image/jpeg",
        name: `image_${index}.jpg`,
      } as any);
    });

    const response = await fetch(`${this.baseURL}/api/uploads/feed`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type for FormData, let the browser set it with boundary
      },
      body: formData,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Failed to upload feed images");
    }

    // Backend returns: { success: true, message: '...', data: imagesData[] }
    // Return in format expected by components: { images: imagesData[] }
    if (data.success && data.data) {
      return { images: data.data };
    }

    // Fallback for different response formats
    return data;
  }

  async deleteImage(publicId: string) {
    return await this.request(`/api/uploads/${publicId}`, {
      method: "DELETE",
    });
  }

  // Feed endpoints
  async getFeedPosts() {
    return await this.request("/api/feed");
  }

  async createFeedPost(postData: any) {
    return await this.request("/api/feed", {
      method: "POST",
      body: JSON.stringify(postData),
    });
  }

  async addComment(postId: string, text: string) {
    return await this.request(`/api/feed/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ text }),
    });
  }

  async getPostComments(postId: string) {
    return await this.request(`/api/feed/${postId}/comments`);
  }

  async savePost(postId: string) {
    return await this.request(`/api/feed/${postId}/save`, {
      method: "POST",
    });
  }

  async deletePost(postId: string) {
    return await this.request(`/api/feed/${postId}`, {
      method: "DELETE",
    });
  }

  // Block Management API
  async createBlock(blockData: any) {
    return await this.request("/api/blocks", {
      method: "POST",
      body: JSON.stringify(blockData),
    });
  }

  async getMyBlocks() {
    return await this.request("/api/blocks/my-blocks");
  }

  async getBlock(blockId: string) {
    return await this.request(`/api/blocks/${blockId}`);
  }

  async updateBlock(blockId: string, blockData: any) {
    return await this.request(`/api/blocks/${blockId}`, {
      method: "PUT",
      body: JSON.stringify(blockData),
    });
  }

  async deleteBlock(blockId: string) {
    return await this.request(`/api/blocks/${blockId}`, {
      method: "DELETE",
    });
  }

  // Trip Request API methods
  async sendTripJoinRequest(
    tripId: string,
    message: string = "",
    selectedItineraries: string[] = []
  ) {
    return await this.request(`/api/trip-requests/${tripId}/request`, {
      method: "POST",
      body: JSON.stringify({ message, selectedItineraries }),
    });
  }

  async getItineraryParticipants(tripId: string) {
    return await this.request(
      `/api/trip-requests/${tripId}/itinerary-participants`
    );
  }

  async checkUserRequest(tripId: string) {
    return await this.request(`/api/trip-requests/${tripId}/check-request`);
  }

  async getTripJoinRequests(tripId: string) {
    return await this.request(`/api/trip-requests/${tripId}/requests`);
  }

  async acceptTripJoinRequest(requestId: string) {
    return await this.request(
      `/api/trip-requests/requests/${requestId}/accept`,
      {
        method: "POST",
      }
    );
  }

  async rejectTripJoinRequest(requestId: string) {
    return await this.request(
      `/api/trip-requests/requests/${requestId}/reject`,
      {
        method: "POST",
      }
    );
  }

  async getMyTripRequests() {
    return await this.request("/api/trip-requests/my-requests");
  }

  async getMyTripRequestsAsOwner() {
    return await this.request("/api/trip-requests/my-trips-requests");
  }

  async getMyChatRooms() {
    return await this.request("/api/trip-requests/my-chat-rooms");
  }

  async deleteChatRoom(chatRoomId: string) {
    return await this.request(`/api/trip-requests/chat-rooms/${chatRoomId}`, {
      method: "DELETE",
    });
  }

  async suggestSubBlock(subBlockData: any) {
    return await this.request("/api/blocks/suggest", {
      method: "POST",
      body: JSON.stringify(subBlockData),
    });
  }

  async approveSubBlock(subBlockId: string, approved: boolean) {
    return await this.request(`/api/blocks/approve/${subBlockId}`, {
      method: "PATCH",
      body: JSON.stringify({ approved }),
    });
  }

  async getSubBlocks(blockId: string) {
    return await this.request(`/api/blocks/${blockId}/sub-blocks`);
  }

  // Family/Couple specific API methods
  async getFamilyBlocks() {
    return await this.request("/api/blocks/family/blocks");
  }

  async addFamilyMember(blockId: string, memberId: string) {
    return await this.request(`/api/blocks/${blockId}/add-member`, {
      method: "POST",
      body: JSON.stringify({ memberId }),
    });
  }
}

// Export singleton instance
export const api = new ApiClient();
export default api;
