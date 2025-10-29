// Always use production URL
const API_BASE_URL = 'https://callcenter.skillmissionassam.org';

// API service class
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const config = {
      ...defaultOptions,
      ...options,
    };



    try {
      const response = await fetch(url, {
        method: config.method,
        headers: config.headers,
        body: config.body,
        mode: 'cors',
        credentials: 'omit'
      });
      
      // Try to parse JSON response first
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        // If response is not JSON, check if it's successful
        if (response.ok) {
          data = { success: true, message: 'Request successful' };
        } else {
          throw new Error('Invalid response format');
        }
      }
      
      // Handle different HTTP status codes
      if (response.status === 401) {
        throw new Error('Unauthorized: Invalid credentials');
      } else if (response.status === 403) {
        throw new Error('Forbidden: Access denied');
      } else if (response.status === 404) {
        throw new Error('Not found: The requested resource was not found');
      } else if (response.status === 500) {
        throw new Error('Server error: Please try again later');
      } else if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Please check your internet connection');
      }
      
      throw error;
    }
  }

  // Login method
  async login(credentials) {
    return this.request('/nw/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // Master data method
  async getMasterData() {
    return this.request('/nw/master', {
      method: 'POST',
    });
  }

  // Test method to check basic connectivity
  async testConnection() {
    return this.request('/nw/master', {
      method: 'POST',
    });
  }

  // Save grievance method
  async saveGrievance(grievanceData) {
    // Extract question responses if they exist
    const { questionResponses, ...mainData } = grievanceData;
    
    // Prepare the main grievance data
    const requestData = {
      ...mainData,
      questionResponses: questionResponses || {}
    };

    // Ensure proper content-type and format
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestData)
    };

    return this.authenticatedRequest('/nw/user/save', requestOptions);
  }

  // Get grievances list method
  async getGrievances(loginId, currentPage = 1, pageSize = 10, filters = {}) {
    const requestData = {
      loginId: loginId,
      currentPage: currentPage,
      pageSize: pageSize
    };

    // Add filters if provided
    if (filters.ticketId) requestData.ticketId = filters.ticketId;
    if (filters.userName) requestData.userName = filters.userName;
    if (filters.userMobile) requestData.userMobile = filters.userMobile;
    if (filters.userRole) requestData.userRole = filters.userRole;
    if (filters.queryType) requestData.queryType = filters.queryType;
    if (filters.status) requestData.status = filters.status;
    if (filters.isUnanswered) requestData.isUnanswered = filters.isUnanswered;
    if (filters.district) requestData.district = filters.district;
    if (filters.entryType) requestData.entryType = filters.entryType;

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestData)
    };

    return this.authenticatedRequest('/nw/user/get', requestOptions);
  }

  // Get dashboard statistics method
  async getDashboardStats() {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    };

    return this.authenticatedRequest('/nw/dashboard', requestOptions);
  }

  // Get chat data method
  async getChatData(pklCrmUserId) {
    const requestData = {
      id: parseInt(pklCrmUserId)
    };

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestData)
    };

    return this.authenticatedRequest('/nw/chat/id', requestOptions);
  }

  // Send chat reply method
  async sendChatReply(replyData) {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(replyData)
    };

    return this.authenticatedRequest('/nw/chat/reply', requestOptions);
  }

  // Get user data method for candidate search
  async getUserData(searchData) {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(searchData)
    };

    return this.authenticatedRequest('/nw/master/get/user-data', requestOptions);
  }

  // Get questions method for query type
  async getQuestions(userRoleId, queryTypeId) {
    const requestData = {
      userRoleId: userRoleId,
      queryTypeId: queryTypeId
    };

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestData)
    };

    return this.authenticatedRequest('/nw/master/get/questions', requestOptions);
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  // Set auth token to localStorage
  setAuthToken(token) {
    localStorage.setItem('authToken', token);
  }

  // Remove auth token from localStorage
  removeAuthToken() {
    localStorage.removeItem('authToken');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getAuthToken();
  }

  // Authenticated request method
  async authenticatedRequest(endpoint, options = {}) {
    const token = this.getAuthToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Ensure proper headers
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    };

    return this.request(endpoint, {
      ...options,
      headers,
    });
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService; 