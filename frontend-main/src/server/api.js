// API layer for all backend communication
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.exora.in'

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = this.getToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        // Handle 401 Unauthorized specifically
        if (response.status === 401) {
          this.removeToken()
          throw new Error('Authentication failed. Please login again.')
        }
        
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Get token from cookies
  getToken() {
    if (typeof window === 'undefined') return null
    const cookies = document.cookie.split(';')
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('authToken='))
    return tokenCookie ? tokenCookie.split('=')[1] : null
  }

  // Set token in cookies
  setToken(token) {
    if (typeof window === 'undefined') return
    document.cookie = `authToken=${token}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`
  }

  // Remove token from cookies
  removeToken() {
    if (typeof window === 'undefined') return
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  }

  // Authentication endpoints
  async login(email, password) {
    const response = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    
    if (response && response.token) {
      this.setToken(response.token)
    }
    
    return response
  }

  async register(userData) {
    const response = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
    
    if (response && response.token) {
      this.setToken(response.token)
    }
    
    return response
  }

  async logout() {
    try {
      await this.request('/api/auth/logout', {
        method: 'POST',
      })
    } finally {
      this.removeToken()
    }
  }

  async getCurrentUser() {
    const response = await this.request('/api/auth/me')
    return response
  }

  async getUserById(userId) {
    console.log('API: Getting user by ID:', userId)
    const result = await this.request(`/api/users/${userId}`)
    console.log('API: User response:', result)
    return result
  }

  async updateProfile(userData) {
    return await this.request('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
  }

  // User preferences
  async updatePreferences(preferences) {
    return await this.request('/api/user/preferences', {
      method: 'PUT',
      body: JSON.stringify({ preferences }),
    })
  }

  // Travel experiences
  async getExperiences(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString()
    return await this.request(`/api/experiences?${queryParams}`)
  }

  async createExperience(experienceData) {
    return await this.request('/api/experiences', {
      method: 'POST',
      body: JSON.stringify(experienceData),
    })
  }

  async joinExperience(experienceId) {
    return await this.request(`/api/experiences/${experienceId}/join`, {
      method: 'POST',
    })
  }

  // Trips
  async getTrips() {
    return await this.request('/api/trips')
  }

  async getPublicTrips() {
    return await this.request('/api/trips/public')
  }

  async createTrip(tripData) {
    return await this.request('/api/trips', {
      method: 'POST',
      body: JSON.stringify(tripData),
    })
  }

  async updateTrip(tripId, tripData) {
    return await this.request(`/api/trips/${tripId}`, {
      method: 'PUT',
      body: JSON.stringify(tripData),
    })
  }

  // Feed/Posts
  async getFeed(page = 1, limit = 10) {
    return await this.request(`/api/feed?page=${page}&limit=${limit}`)
  }

  async createPost(postData) {
    return await this.request('/api/feed', {
      method: 'POST',
      body: JSON.stringify(postData),
    })
  }

  async likePost(postId) {
    return await this.request(`/api/feed/${postId}/like`, {
      method: 'POST',
    })
  }

  // Connections
  async getConnections() {
    return await this.request('/api/connections')
  }

  async sendConnectionRequest(userId) {
    return await this.request(`/api/connections/${userId}/request`, {
      method: 'POST',
    })
  }

  async acceptConnectionRequest(connectionId) {
    return await this.request(`/api/connections/${connectionId}/accept`, {
      method: 'POST',
    })
  }

  async rejectConnectionRequest(connectionId) {
    return await this.request(`/api/connections/${connectionId}/reject`, {
      method: 'POST',
    })
  }

  // Image upload endpoints
  async uploadProfileImage(imageFile) {
    const formData = new FormData()
    formData.append('image', imageFile)
    
    const response = await fetch(`${this.baseURL}/api/uploads/profile`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`
      },
      body: formData
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Failed to upload profile image')
    }
    
    return await response.json()
  }

  async uploadFeedImages(imageFiles) {
    const formData = new FormData()
    imageFiles.forEach((file, index) => {
      formData.append('images', file)
    })
    
    const response = await fetch(`${this.baseURL}/api/uploads/feed`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`
      },
      body: formData
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Upload error:', errorData)
      throw new Error(errorData.message || 'Failed to upload feed images')
    }
    
    const result = await response.json()
    return result
  }

  async deleteImage(publicId) {
    return await this.request(`/api/uploads/${publicId}`, {
      method: 'DELETE'
    })
  }

  // Feed endpoints
  async getFeedPosts() {
    return await this.request('/api/feed')
  }

  async createFeedPost(postData) {
    return await this.request('/api/feed', {
      method: 'POST',
      body: JSON.stringify(postData)
    })
  }

  async likePost(postId) {
    return await this.request(`/api/feed/${postId}/like`, {
      method: 'POST'
    })
  }

  async addComment(postId, text) {
    return await this.request(`/api/feed/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text })
    })
  }

  async getPostComments(postId) {
    return await this.request(`/api/feed/${postId}/comments`)
  }

  async savePost(postId) {
    return await this.request(`/api/feed/${postId}/save`, {
      method: 'POST'
    })
  }

  async deletePost(postId) {
    return await this.request(`/api/feed/${postId}`, {
      method: 'DELETE'
    })
  }

  // Block Management API
  async createBlock(blockData) {
    return await this.request('/api/blocks', {
      method: 'POST',
      body: JSON.stringify(blockData),
    })
  }

  async getMyBlocks() {
    return await this.request('/api/blocks/my-blocks')
  }

  async getBlock(blockId) {
    return await this.request(`/api/blocks/${blockId}`)
  }

  async updateBlock(blockId, blockData) {
    return await this.request(`/api/blocks/${blockId}`, {
      method: 'PUT',
      body: JSON.stringify(blockData),
    })
  }

  async deleteBlock(blockId) {
    return await this.request(`/api/blocks/${blockId}`, {
      method: 'DELETE',
    })
  }

  // Trip Request API methods
  async sendTripJoinRequest(tripId, message = '', selectedItineraries = []) {
    return await this.request(`/api/trip-requests/${tripId}/request`, {
      method: 'POST',
      body: JSON.stringify({ message, selectedItineraries }),
    })
  }

  async getItineraryParticipants(tripId) {
    return await this.request(`/api/trip-requests/${tripId}/itinerary-participants`)
  }

  async checkUserRequest(tripId) {
    return await this.request(`/api/trip-requests/${tripId}/check-request`)
  }

  async getTripJoinRequests(tripId) {
    return await this.request(`/api/trip-requests/${tripId}/requests`)
  }

  async acceptTripJoinRequest(requestId) {
    return await this.request(`/api/trip-requests/requests/${requestId}/accept`, {
      method: 'POST',
    })
  }

  async rejectTripJoinRequest(requestId) {
    return await this.request(`/api/trip-requests/requests/${requestId}/reject`, {
      method: 'POST',
    })
  }

  async getMyTripRequests() {
    return await this.request('/api/trip-requests/my-requests')
  }

  async getMyTripRequestsAsOwner() {
    return await this.request('/api/trip-requests/my-trips-requests')
  }

  async getMyChatRooms() {
    return await this.request('/api/trip-requests/my-chat-rooms')
  }

  // Waitlist endpoints
  async addToWaitlist(data) {
    return await this.request('/api/waitlisters', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async deleteChatRoom(chatRoomId) {
    return await this.request(`/api/trip-requests/chat-rooms/${chatRoomId}`, {
      method: 'DELETE'
    })
  }

  async suggestSubBlock(subBlockData) {
    return await this.request('/api/blocks/suggest', {
      method: 'POST',
      body: JSON.stringify(subBlockData),
    })
  }

  async approveSubBlock(subBlockId, approved) {
    return await this.request(`/api/blocks/approve/${subBlockId}`, {
      method: 'PATCH',
      body: JSON.stringify({ approved }),
    })
  }

  async getSubBlocks(blockId) {
    return await this.request(`/api/blocks/${blockId}/sub-blocks`)
  }

  // Family/Couple specific API methods
  async getFamilyBlocks() {
    return await this.request('/api/blocks/family/blocks')
  }

  async addFamilyMember(blockId, memberId) {
    return await this.request(`/api/blocks/${blockId}/add-member`, {
      method: 'POST',
      body: JSON.stringify({ memberId }),
    })
  }
}

// Export singleton instance
export const api = new ApiClient()
export default api
