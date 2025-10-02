// Get API base URL from environment variable with fallback
const getApiBaseUrl = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (!apiUrl) {
    console.warn(
      'NEXT_PUBLIC_API_URL environment variable is not set. Using default: http://localhost:3001'
    );
    return 'http://localhost:3001';
  }
  
  // Remove trailing slash if present
  return apiUrl.replace(/\/$/, '');
};

const API_BASE_URL = getApiBaseUrl();

// Export the API base URL for use in other parts of the application
export const getApiUrl = () => API_BASE_URL;

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'ADMIN' | 'USER';
  organizationId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
  organizationId?: string;
  organizationName?: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  private setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('access_token', token);
    // Also set as cookie for SSR support
    document.cookie = `access_token=${token}; path=/; max-age=86400; samesite=strict`;
  }

  private removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('access_token');
    // Also remove cookie
    document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    this.setToken(response.access_token);
    return response;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    this.setToken(response.access_token);
    return response;
  }

  async getProfile(): Promise<User> {
    return this.request<User>('/auth/profile');
  }

  async validateToken(): Promise<{ valid: boolean; user?: User }> {
    return this.request<{ valid: boolean; user?: User }>('/auth/validate');
  }

  async logout(): Promise<void> {
    this.removeToken();
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
