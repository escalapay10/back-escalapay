import { describe, it, expect, vi, afterEach } from "vitest"
import { httpGet } from "../../src/utils/httpClient.js"

describe("Cliente HTTP", () => {
    afterEach(() => {
        vi.unstubAllGlobals()
        vi.useRealTimers()
    })

    it("Debe devolver los datos de una respuesta exitosa", async () => {
        const data = {
            base: "USD",
            rates: { EUR: 0.92 }
        }

        const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
            Response.json(data)
        )

        vi.stubGlobal("fetch", fetchMock)

        const result = await httpGet("https://example.com/rates")

        expect(result).toEqual(data)
    })

    it("Debe informar el estado cuando el proveedor responde con un error HTTP", async () => {
        const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
            new Response(null, { status: 503 })
        )

        vi.stubGlobal("fetch", fetchMock)

        await expect(
            httpGet("https://example.com/rates")
        ).rejects.toMatchObject({
            name: "HttpClientError",
            code: "HTTP_ERROR",
            status: 503
        })
    })

    it("Debe informar un error de red cuando falla la conexión", async () => {
        const fetchMock = vi.fn<typeof fetch>().mockRejectedValue(
            new TypeError("fetch failed")
        )

        vi.stubGlobal("fetch", fetchMock)

        await expect(
            httpGet("https://example.com/rates")
        ).rejects.toMatchObject({
            name: "HttpClientError",
            code: "NETWORK_ERROR"
        })
    })

    it("Debe cancelar la petición cuando supera el timeout", async () => {
        vi.useFakeTimers()

        const fetchMock = vi.fn<typeof fetch>().mockImplementation(
            (_url, options) =>
                new Promise<Response>((_resolve, reject) => {
                    options?.signal?.addEventListener(
                        "abort",
                        () => {
                            reject(
                                new DOMException(
                                    "The request was aborted",
                                    "AbortError"
                                )
                            )
                        },
                        { once: true }
                    )
                })
        )

        vi.stubGlobal("fetch", fetchMock)

        const request = httpGet("https://example.com/rates")

        const assertion = expect(request).rejects.toMatchObject({
            name: "HttpClientError",
            code: "TIMEOUT"
        })

        await vi.advanceTimersByTimeAsync(4000)
        await assertion
    })
})