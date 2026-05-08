export interface ApiResponse<T>{
    status: number;
    body: T;
    headers: Record<string, string>;
}

export interface RequestOptions {
    headers?: Record<string, string>;
    params?: Record<string, string>;
}