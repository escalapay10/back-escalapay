export interface HttpGetOptions {
    timeoutMs?: number
    headers?: Record<string, string>
}

export type HttpClientErrorCode =
    | "HTTP_ERROR"
    | "NETWORK_ERROR"
    | "TIMEOUT"
    | "INVALID_JSON"