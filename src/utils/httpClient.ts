import { HttpClientError } from "../errors/HttpClientError.js"
import type { HttpGetOptions } from "../types/httpClient.types.js"

export async function httpGet(
    url: string,
    options: HttpGetOptions = {}
): Promise<unknown> {
    const { timeoutMs = 4000, headers = {} } = options

    const controller = new AbortController()

    const timeoutId = setTimeout(() => {
        controller.abort()
    }, timeoutMs)

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                Accept: "application/json",
                ...headers
            },
            signal: controller.signal
        })

        if (!response.ok) {
            throw new HttpClientError(
                `External service returned HTTP ${response.status}`,
                "HTTP_ERROR",
                response.status
            )
        }

        try {
            const data: unknown = await response.json()
            return data
        } catch (error) {
            if (error instanceof SyntaxError) {
                throw new HttpClientError(
                    "External service returned invalid JSON",
                    "INVALID_JSON"
                )
            }

            throw error
        }
    } catch (error) {
        if (controller.signal.aborted) {
            throw new HttpClientError(
                "External request timed out",
                "TIMEOUT"
            )
        }

        if (error instanceof HttpClientError) {
            throw error
        }

        throw new HttpClientError(
            "External request failed",
            "NETWORK_ERROR"
        )
    } finally {
        clearTimeout(timeoutId)
    }
}