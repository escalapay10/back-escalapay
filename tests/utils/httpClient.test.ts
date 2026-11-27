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

    it("Debe informar el timeout cuando ambos intentos superan el tiempo de espera", async () => {
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

        await vi.advanceTimersByTimeAsync(8500)
        await assertion

        expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    it("Debe recuperar la consulta en el segundo intento después de un error temporal", async () => {
        vi.useFakeTimers()

        const data = { base: "USD", rates: { EUR: 0.92 } }

        const fetchMock = vi.fn<typeof fetch>()
            .mockResolvedValueOnce(new Response(null, { status: 503 }))
            .mockResolvedValueOnce(Response.json(data))

        vi.stubGlobal("fetch", fetchMock)

        const request = httpGet("https://example.com/rates")
        const assertion = expect(request).resolves.toEqual(data)

        await vi.advanceTimersByTimeAsync(499)

        expect(fetchMock).toHaveBeenCalledTimes(1)

        await vi.advanceTimersByTimeAsync(1)
        await assertion

        expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    it("No debe reintentar una petición rechazada por credenciales inválidas", async () => {
        const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
            new Response(null, { status: 401 })
        )

        vi.stubGlobal("fetch", fetchMock)

        await expect(
            httpGet("https://example.com/rates")
        ).rejects.toMatchObject({
            code: "HTTP_ERROR",
            status: 401
        })

        expect(fetchMock).toHaveBeenCalledTimes(1)
    })
})