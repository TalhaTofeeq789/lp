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
  data: {
    token: string;
    uid: string;
    username: string;
  };
  message: string;
  status: string;
}

// Backend API Configuration
const API_BASE_URL = 'https://web-scraper-backend-kappa.vercel.app';

// Authentication Service Class
class AuthService {
  
  // Sign in with email and password via backend API
  async signInWithEmailAndPassword(email: string, password: string): Promise<AuthResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Authentication failed');
      }

      const data: BackendAuthResponse = await response.json();
      
      // Check if the response indicates success
      if (data.status !== 'success') {
        throw new Error(data.message || 'Authentication failed');
      }

      return {
        user: {
          uid: data.data.uid,
          email: email, // The backend doesn't return email, so we use the input
          displayName: data.data.username,
          username: data.data.username
        },
        token: data.data.token
      };
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.message || 'Authentication failed');
    }
  }

  // Sign out via backend API (if your backend has a logout endpoint)
  async signOut(): Promise<void> {
    try {
      const token = this.getStoredToken();
                
      // If your backend has a logout endpoint, uncomment and update this:
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

  // Get current user from local storage
  getCurrentUser(): User | null {
    const userInfo = localStorage.getItem('optimizeHub-user');
    if (userInfo) {
      try {
        return JSON.parse(userInfo);
      } catch (error) {
        console.error('Invalid user data in localStorage:', error);
        return null;
      }
    }
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
}

// Export singleton instance
export const authService = new AuthService();

// Error message mapping for better UX
export const getAuthErrorMessage = (errorMessage: string): string => {
  // Map backend error messages to user-friendly messages
  if (errorMessage.includes('Invalid credentials') || errorMessage.includes('invalid-credential')) {
    return 'Invalid email or password. Please check your credentials.';
  }
  if (errorMessage.includes('User not found') || errorMessage.includes('user-not-found')) {
    return 'No account found with this email address.';
  }
  if (errorMessage.includes('Too many requests') || errorMessage.includes('too-many-requests')) {
    return 'Too many failed attempts. Please try again later.';
  }
  if (errorMessage.includes('Network error') || errorMessage.includes('network')) {
    return 'Network error. Please check your connection and try again.';
  }
  
  return errorMessage || 'An unexpected error occurred. Please try again.';
};
