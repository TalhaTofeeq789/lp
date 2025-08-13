// Authentication Service - Backend API Integration
// This service calls your backend API instead of Firebase directly

// Types for Authentication
export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  username?: string;
}

export interface AuthResult {
  user: User;
  token: string;
}

// Backend API Response Types
interface BackendAuthResponse {
  data?: {
    token?: string;
    uid?: string;
    user_id?: string;
    username?: string;
    email?: string;
  };
  message: string;
  status: string;
  // Allow any additional fields
  [key: string]: any;
}

// Backend API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://web-scraper-backend-kappa.vercel.app';

// Authentication Service Class
class AuthService {
  
  // Sign in with email and password via backend API
  async signInWithEmailAndPassword(userEmail: string, password: string): Promise<AuthResult> {
    try {
      console.log('=== STARTING LOGIN PROCESS ===');
      console.log('Attempting login for:', userEmail);
      console.log('API URL:', `${API_BASE_URL}/auth/login`);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail, password }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.log('Error response data:', errorData);
        throw new Error(errorData.message || 'Authentication failed');
      }

      const data: BackendAuthResponse = await response.json();
      console.log('=== FULL BACKEND RESPONSE ===');
      console.log('Complete response object:', JSON.stringify(data, null, 2));
      
      // Check if the response indicates success
      if (data.status !== 'success') {
        throw new Error(data.message || 'Authentication failed');
      }

      // Extract values from the actual response structure
      let user_id = data.data?.user_id;
      let email = data.data?.email;
      let username = data.data?.username;
      let token = data.data?.token;

      console.log('Extracted values:');
      console.log('- User ID:', user_id);
      console.log('- Email:', email);
      console.log('- Username:', username);
      console.log('- Token:', token ? '[EXISTS]' : '[MISSING]');

      if (!user_id) {
        console.error('No user_id found in response!');
        throw new Error('Invalid response from server - missing user ID');
      }

      if (!token) {
        console.error('No token found in response!');
        throw new Error('Invalid response from server - missing authentication token');
      }

      const authResult = {
        user: {
          uid: user_id,
          email: email || userEmail, // Use response email or fallback to input email
          displayName: username || null,
          username: username
        },
        token: token
      };

      console.log('Created auth result:', authResult);

      // Automatically store user data and token in localStorage
      this.storeUserData(authResult.user, authResult.token);

      return authResult;
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.message || 'Authentication failed');
    }
  }

  // Helper method to store user data and token
  private storeUserData(user: User, token: string): void {
    console.log('=== STORING USER DATA ===');
    console.log('User object to store:', user);
    console.log('UID to store:', user.uid);
    console.log('Email to store:', user.email);
    console.log('Token to store:', token ? '[TOKEN EXISTS]' : '[NO TOKEN]');
    
    // Store user data
    const userDataString = JSON.stringify(user);
    localStorage.setItem('optimizeHub-user', userDataString);
    console.log('Stored user string:', userDataString);
    
    // Store token
    localStorage.setItem('optimizeHub-token', token);
    
    // Verify storage immediately
    const storedUser = localStorage.getItem('optimizeHub-user');
    const storedToken = localStorage.getItem('optimizeHub-token');
    console.log('Verification - stored user:', storedUser);
    console.log('Verification - stored token exists:', !!storedToken);
    
    // Parse and verify UID is there
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      console.log('Verification - parsed UID:', parsedUser.uid);
    }
    
    console.log('=== USER DATA STORED ===');
  }

  // Sign out via backend API (if your backend has a logout endpoint)
  async signOut(): Promise<void> {
    try {
      // If your backend has a logout endpoint, uncomment and update this:
      // const token = this.getStoredToken();
      // await fetch(`${API_BASE_URL}/auth/logout`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      // });
      
      console.log('User signed out');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem('optimizeHub-auth');
      localStorage.removeItem('optimizeHub-user');
      localStorage.removeItem('optimizeHub-token');
    }
  }

  // Change password via backend API
  async changePassword(oldPassword: string, newPassword: string): Promise<{ message: string; status: string }> {
    try {
      const user = this.getCurrentUser();
      const token = this.getStoredToken();
      
      if (!user || !token) {
        throw new Error('User not authenticated');
      }

      // Validate that we have all required fields
      if (!user.uid || !user.email || !oldPassword || !newPassword) {
        console.error('Missing required fields:', {
          uid: !!user.uid,
          email: !!user.email,
          oldPassword: !!oldPassword,
          newPassword: !!newPassword
        });
        throw new Error('Missing required information for password change');
      }

      const requestBody = {
        uid: user.uid, // This maps to user_id from login response
        email: user.email,
        old_password: oldPassword,
        new_password: newPassword,
      };

      console.log('Change password request:', {
        uid: user.uid,
        email: user.email,
        old_password: '[HIDDEN]',
        new_password: '[HIDDEN]'
      });

      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      console.log('Change password response:', {
        status: data.status,
        message: data.message
      });

      if (!response.ok || data.status !== 'success') {
        throw new Error(data.message || 'Password change failed');
      }

      return data;
    } catch (error: any) {
      console.error('Change password error:', error);
      throw new Error(error.message || 'Failed to change password');
    }
  }

  // Get current user from local storage
  getCurrentUser(): User | null {
    const userInfo = localStorage.getItem('optimizeHub-user');
    console.log('Raw user info from localStorage:', userInfo);
    
    if (userInfo) {
      try {
        const userData = JSON.parse(userInfo);
        console.log('Parsed user data:', userData);
        console.log('UID exists:', !!userData.uid);
        console.log('Email exists:', !!userData.email);
        return userData;
      } catch (error) {
        console.error('Invalid user data in localStorage:', error);
        return null;
      }
    }
    console.log('No user info found in localStorage');
    return null;
  }

  // Get stored authentication token
  getStoredToken(): string | null {
    return localStorage.getItem('optimizeHub-token');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    const token = this.getStoredToken();
    return user !== null && token !== null;
  }

  // Verify token with backend (update this if your backend has a verify endpoint)
  async verifyToken(): Promise<boolean> {
    try {
      const token = this.getStoredToken();
      if (!token) return false;

      // If your backend has a token verification endpoint, update this:
      // const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      // });
      // return response.ok;

      // For now, we'll just check if token exists and is not expired
      // You can decode the JWT to check expiration if needed
      return true;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(email: string): Promise<{ message: string; status: string }> {
    try {
      console.log('Sending password reset email to:', email);

      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      console.log('Password reset response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send password reset email');
      }

      return {
        message: data.message || 'Password reset email sent successfully',
        status: data.status || 'success'
      };

    } catch (error: any) {
      console.error('Password reset error:', error);
      throw new Error(error.message || 'Failed to send password reset email');
    }
  }
}

// Export singleton instance
export const authService = new AuthService();

// Error message mapping for better UX
export const getAuthErrorMessage = (errorMessage: string): string => {
  // Convert to lowercase for easier matching
  const lowerMessage = errorMessage.toLowerCase();
  
  // Map backend error messages to user-friendly messages
  if (lowerMessage.includes('invalid credentials') || 
      lowerMessage.includes('invalid-credential') ||
      lowerMessage.includes('invalid_login_credentials') ||
      lowerMessage.includes('firebase auth error: invalid_login_credentials') ||
      lowerMessage.includes('wrong-password') ||
      lowerMessage.includes('invalid-email')) {
    return 'Invalid email or password. Please check your credentials.';
  }
  if (lowerMessage.includes('user not found') || 
      lowerMessage.includes('user-not-found')) {
    return 'No account found with this email address.';
  }
  if (lowerMessage.includes('too many requests') || 
      lowerMessage.includes('too-many-requests')) {
    return 'Too many failed attempts. Please try again later.';
  }
  if (lowerMessage.includes('network error') || 
      lowerMessage.includes('network')) {
    return 'Network error. Please check your connection and try again.';
  }
  
  return 'Invalid email or password. Please check your credentials.';
};
