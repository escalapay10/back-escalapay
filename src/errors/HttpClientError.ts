import type { HttpClientErrorCode } from "../types/httpClient.types.js"

export class HttpClientError extends Error {
    constructor(
        message: string,
        public readonly code: HttpClientErrorCode,
        public readonly status?: number
    ) {
        super(message)
        this.name = "HttpClientError"
    }
}