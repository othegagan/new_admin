import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { getSession, signOut } from 'next-auth/react';
import { auth } from './auth';

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

    private async getAuthToken() {
        if (typeof window === 'undefined') {
            // Server-side
            const session = await auth();
            return session?.bundeeToken || process.env.NEXT_PUBLIC_FALLBACK_BUNDEE_AUTH_TOKEN;
        }
        // Client-side
        const session = await getSession();
        return session?.bundeeToken || process.env.NEXT_PUBLIC_FALLBACK_BUNDEE_AUTH_TOKEN;
    }

    private setupInterceptors(): void {
        // Request Interceptor
        this.instance.interceptors.request.use(
            async (config) => {
                try {
                    const token = await this.getAuthToken();
                    config.headers.bundee_auth_token = token;
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
                        message: `No response received from server. ${error.message}`,
                        errorCode: 'NETWORK_ERROR'
                    });
                } else {
                    // Something happened in setting up the request
                    return Promise.reject({
                        success: false,
                        data: null,
                        message: `Error setting up the request. ${error.message}`,
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
            const errorStatus = error.response.status;
            const errorMessages: any = {
                400: 'Bad Request',
                401: 'Unauthorized',
                403: 'Forbidden',
                404: 'Not Found',
                500: 'Internal Server Error',
                502: 'Bad Gateway',
                503: 'Service Unavailable',
                504: 'Gateway Timeout'
            };

            return errorMessages[errorStatus] || `Server Error: ${errorStatus}`;
        }
        return 'Unknown error occurred';
    }

    private transformResponse(response: AxiosResponse): ApiResponse<any> {
        try {
            const data = response.data || {};
            const codes = data.codes || [];
            const successCode = codes.find((code: any) => code.key === 'SUCCESS');

            // Case 1: Explicit success conditions
            if (successCode && data.errorCode === '0') {
                return {
                    success: true,
                    data,
                    message: data.errorMessage || 'Success',
                    errorCode: data.errorCode
                };
            }

            // Case 2: Explicit failure conditions with errorCode = 1
            if (data.errorCode === '1') {
                return {
                    success: false,
                    data: null,
                    message: data.errorMessage || 'An error occurred',
                    errorCode: data.errorCode
                };
            }

            // Case 3: Handle errors based on `codes` array
            if (codes.length > 0) {
                // const errorCodes = codes.map((code: any) => code.key).join(', ');
                const errorMessage = codes.map((code: any) => code.message).join('; ');

                return {
                    success: false,
                    data: null,
                    message: `${errorMessage}`,
                    errorCode: codes[0]?.key || 'UNKNOWN_ERROR'
                };
            }

            // Case 4: Fallback for unknown errors
            return {
                success: false,
                data: null,
                message: 'An unknown error occurred',
                errorCode: 'UNKNOWN_ERROR'
            };
        } catch (error: any) {
            // Unexpected error handling
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

            return (response as any).transformedData;
        } catch (error: any) {
            const errorDetails = {
                url,
                method,
                message: error.message || 'An unexpected error occurred',
                errorCode: 'UNHANDLED_ERROR',
                ...(error.response && { status: error.response.status, statusText: error.response.statusText })
            };

            // Log the error details
            console.error('API Error:', errorDetails);

            // If the error has a transformedData property (from our interceptor), return it
            if (error.response && (error.response as any).transformedData) {
                return (error.response as any).transformedData;
            }

            // Fallback error handling
            return {
                success: false,
                data: null,
                message: errorDetails.message,
                errorCode: errorDetails.errorCode
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
