import { APIRequestContext } from "@playwright/test";
import { ApiResponse, RequestOptions } from "src/types/api.types";
import { getConfig } from "src/helpers/env.helper";

export abstract class BaseApiClient {
    protected readonly baseUrl: string;

    constructor(protected request: APIRequestContext) {
        this.baseUrl = getConfig().API_URL;
    }

    protected async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
        const response = await this.request.get(`${this.baseUrl}${endpoint}`, {
            headers: options?.headers,
            params: options?.params,
        });

        return {
            status: response.status(),
            body: await response.json() as T,
            headers: response.headers() as Record<string, string>,
        }
    }

    protected async post<T>(
        endpoint: string,
        data: unknown,
        options: RequestOptions = {}
    ): Promise<ApiResponse<T>> {
        const response = await this.request.post(`${this.baseUrl}${endpoint}`, {
        data,
        headers: options.headers,
        });

        return {
        status: response.status(),
        body: await response.json() as T,
        headers: response.headers() as Record<string, string>,
        };
    }

  protected async delete<T>(
        endpoint: string,
        options: RequestOptions = {}
    ): Promise<ApiResponse<T>> {
        const response = await this.request.delete(`${this.baseUrl}${endpoint}`, {
        headers: options.headers,
        });

        return {
        status: response.status(),
        body: await response.json() as T,
        headers: response.headers() as Record<string, string>,
        };
    }
}