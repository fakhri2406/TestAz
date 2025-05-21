import { API_CONFIG } from '../config/api';

// API Response type
interface ApiResponse<T> {
    data?: T;
    error?: string;
    status: number;
}

// API Error type
class ApiError extends Error {
    status: number;
    responseData?: any;
    
    constructor(message: string, status: number, responseData?: any) {
        super(message);
        this.status = status;
        this.responseData = responseData;
        this.name = 'ApiError';
    }
}

class ApiService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = API_CONFIG.BASE_URL;
        console.log('API Service initialized with base URL:', this.baseUrl);
    }

    private async fetchWithConfig<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
        const url = `${this.baseUrl}${endpoint}`;
        console.log('Making request to:', url);
        
        const defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json, application/problem+json',
        };

        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        };

        try {
            console.log('Request config:', {
                method: config.method || 'GET',
                headers: config.headers,
                body: config.body ? JSON.parse(config.body as string) : undefined
            });

            const response = await fetch(url, config);
            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));
            
            let data;
            const contentType = response.headers.get('content-type');
            console.log('Response content-type:', contentType);

            try {
                const text = await response.text();
                console.log('Raw response text:', text);

                if (contentType && (contentType.includes('application/json') || contentType.includes('application/problem+json'))) {
                    data = JSON.parse(text);
                    console.log('Parsed JSON response:', data);
                } else {
                    throw new ApiError(
                        `Invalid response format. Expected JSON but got ${contentType || 'unknown content type'}`,
                        response.status,
                        text
                    );
                }
            } catch (parseError) {
                console.error('Error parsing response:', parseError);
                throw new ApiError(
                    'Failed to parse API response',
                    response.status,
                    parseError instanceof Error ? parseError.message : 'Unknown parsing error'
                );
            }

            if (!response.ok) {
                // Handle problem+json format
                if (data?.type === 'https://tools.ietf.org/html/rfc7231#section-6.5.1') {
                    throw new ApiError(
                        data.detail || data.title || 'API request failed',
                        response.status,
                        data
                    );
                }
                throw new ApiError(
                    data?.message || data?.detail || 'API request failed',
                    response.status,
                    data
                );
            }

            return {
                data,
                status: response.status
            };
        } catch (error) {
            console.error('API request failed:', error);
            if (error instanceof ApiError) {
                throw error;
            }
            if (error instanceof TypeError && error.message.includes('Network request failed')) {
                console.error('Network error details:', {
                    url,
                    error: error.message,
                    stack: error.stack
                });
                throw new ApiError('Network error: Please check your connection and API URL', 0);
            }
            throw new ApiError('An unexpected error occurred', 500);
        }
    }

    // Generic GET request
    async get<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.fetchWithConfig<T>(endpoint);
    }

    // Generic POST request
    async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
        return this.fetchWithConfig<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Generic PUT request
    async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
        return this.fetchWithConfig<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    // Generic DELETE request
    async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.fetchWithConfig<T>(endpoint, {
            method: 'DELETE',
        });
    }
}

export const apiService = new ApiService(); 