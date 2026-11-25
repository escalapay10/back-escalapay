import { describe, it, expect, vi, afterEach } from "vitest"
import { ZodError } from "zod"
import { getFrankfurterRates } from "../../src/client/frankfurterClient.js"
import { httpGet } from "../../src/utils/httpClient.js"

vi.mock("../../src/utils/httpClient.js", () => ({
    httpGet: vi.fn()
}))

const httpGetMock = vi.mocked(httpGet)

describe("Cliente de Frankfurter", () => {
    afterEach(() => {
        vi.resetAllMocks()
    })

    it("Debe consultar las monedas solicitadas y devolver las tasas normalizadas", async () => {
        httpGetMock.mockResolvedValue([
            {
                date: "2026-11-25",
                base: "EUR",
                quote: "USD",
                rate: 1.09
            }
        ])

        const result = await getFrankfurterRates(" eur ", ["usd"])

        expect(httpGetMock).toHaveBeenCalledWith(
            "https://api.frankfurter.dev/v2/rates?base=EUR&quotes=USD"
        )

        expect(result).toEqual([
            {
                base: "EUR",
                quote: "USD",
                rate: 1.09,
                date: "2026-11-25",
                provider: "frankfurter"
            }
        ])
    })

    it("Debe rechazar la moneda base como destino sin consultar al proveedor", async () => {
        await expect(
            getFrankfurterRates("EUR", ["USD", "eur"])
        ).rejects.toBeInstanceOf(ZodError)

        expect(httpGetMock).not.toHaveBeenCalled()
    })

    it("Debe rechazar una respuesta con una tasa inválida", async () => {
        httpGetMock.mockResolvedValue([
            {
                date: "2026-11-25",
                base: "EUR",
                quote: "USD",
                rate: -1
            }
        ])

        await expect(
            getFrankfurterRates("EUR", ["USD"])
        ).rejects.toBeInstanceOf(ZodError)
    })

    it("Debe rechazar una respuesta que no incluya todas las monedas solicitadas", async () => {
        httpGetMock.mockResolvedValue([
            {
                date: "2026-11-25",
                base: "EUR",
                quote: "USD",
                rate: 1.09
            }
        ])

        await expect(
            getFrankfurterRates("EUR", ["USD", "ARS"])
        ).rejects.toBeInstanceOf(ZodError)
    })
})