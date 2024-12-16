import { auth, signOut } from '@/lib/auth';
import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T | null;
    errorCode?: string;
    [key: string]: unknown;
}

class ApiService {
    private instance: AxiosInstance;

    constructor() {
        this.instance = axios.create({
            baseURL: '',
            headers: {
                'Content-Type': 'application/json',
                Accept: '*/*'
            }
        });

        this.setupInterceptors();
    }

    private setupInterceptors(): void {
        // Request Interceptor
        this.instance.interceptors.request.use(
            async (config) => {
                try {
                    const session = await auth();
                    if (session?.bundeeToken) {
                        config.headers.bundee_auth_token = session.bundeeToken;
                    }
                    return config;
                } catch (error) {
                    console.error('Error in request interceptor:', error);
                    return config;
                }
            },
            (error) => Promise.reject(this.handleError(error))
        );

        // Response Interceptor
        this.instance.interceptors.response.use(
            (response) => {
                // Attach custom transformation to the response
                (response as any).transformedData = this.transformResponse(response);
                return response;
            },
            async (error: AxiosError) => {
                // Handle different types of errors
                if (error.response) {
                    // The request was made and the server responded with a status code outside of 2xx
                    if (error.response.status === 401) {
                        try {
                            await signOut();
                            window.location.href = '/sign-in';
                        } catch (refreshError) {
                            console.error('Error refreshing session:', refreshError);
                        }
                    }

                    // Create a transformed error response for server errors
                    const transformedError: ApiResponse<null> = {
                        success: false,
                        data: null,
                        message: this.getErrorMessage(error),
                        errorCode: error.response.status.toString()
                    };
                    (error.response as any).transformedData = transformedError;
                } else if (error.request) {
                    // The request was made but no response was received
                    return Promise.reject({
                        success: false,
                        data: null,
                        message: 'No response received from server',
                        errorCode: 'NETWORK_ERROR'
                    });
                } else {
                    // Something happened in setting up the request
                    return Promise.reject({
                        success: false,
                        data: null,
                        message: 'Error setting up the request',
                        errorCode: 'REQUEST_SETUP_ERROR'
                    });
                }

                return Promise.reject(error);
            }
        );
    }

    private getErrorMessage(error: AxiosError): string {
        if (error.response) {
            // Server responded with an error status
            switch (error.response.status) {
                case 400:
                    return 'Bad Request';
                case 401:
                    return 'Unauthorized';
                case 403:
                    return 'Forbidden';
                case 404:
                    return 'Not Found';
                case 500:
                    return 'Internal Server Error';
                case 502:
                    return 'Bad Gateway';
                case 503:
                    return 'Service Unavailable';
                case 504:
                    return 'Gateway Timeout';
                default:
                    return `Server Error: ${error.response.status}`;
            }
        }
        return 'Unknown error occurred';
    }

    private transformResponse(response: AxiosResponse): ApiResponse<any> {
        try {
            // Check if response.data exists and is an object
            const data = response.data || {};

            // Handle cases where codes might not exist
            const codes = Array.isArray(data.codes) ? data.codes : [];
            const successCode = codes.find((code: any) => code.key === 'SUCCESS');

            // Check for success conditions
            const isSuccessful =
                (successCode && successCode.key === 'SUCCESS') ||
                data.errorCode === '0' ||
                (response.status >= 200 && response.status < 300);

            if (isSuccessful) {
                return {
                    success: true,
                    data: data,
                    message: data.errorMessage || 'Success',
                    errorCode: data.errorCode || response.status.toString()
                };
            }
            const errorCodes = codes.map((code: any) => code.key).join(', ');
            return {
                success: false,
                data: null,
                message: data.errorMessage || (errorCodes ? `Error: ${errorCodes}` : 'Unknown error occurred'),
                errorCode: data.errorCode || response.status.toString()
            };
        } catch (error: any) {
            return {
                success: false,
                data: null,
                message: `Unexpected error: ${error.message || error}`,
                errorCode: 'UNEXPECTED_ERROR'
            };
        }
    }

    private handleError(error: any): string {
        return error || 'An unknown error occurred.';
    }

    public async request<T>(method: string, url: string, config?: AxiosRequestConfig, data?: unknown): Promise<ApiResponse<T>> {
        try {
            const response = await this.instance.request<any>({
                method,
                url,
                data,
                ...config
            });

            // Return the transformed data
            return (response as any).transformedData;
        } catch (error: any) {
            // If the error has a transformedData property (from our interceptor), return it
            if (error.response && (error.response as any).transformedData) {
                return (error.response as any).transformedData;
            }

            // Fallback error handling
            return {
                success: false,
                data: null,
                message: error.message || 'An unexpected error occurred',
                errorCode: 'UNHANDLED_ERROR'
            };
        }
    }

    public async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        return this.request<T>('GET', url, config);
    }

    public async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        return this.request<T>('POST', url, config, data);
    }

    public async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        return this.request<T>('PUT', url, config, data);
    }

    public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        return this.request<T>('DELETE', url, config);
    }
}

// Create a singleton instance
export const api = new ApiService();
