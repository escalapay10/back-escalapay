import {
    describe,
    it,
    expect,
    vi,
    beforeEach,
    afterEach
} from "vitest"
import { ZodError } from "zod"
import {
    getExchangeRateApiRates
} from "../../src/client/exchangeRateApiClient.js"
import { httpGet } from "../../src/utils/httpClient.js"

vi.mock("../../src/utils/httpClient.js", () => ({
    httpGet: vi.fn()
}))

const httpGetMock = vi.mocked(httpGet)

describe("Cliente de ExchangeRate-API", () => {
    beforeEach(() => {
        vi.stubEnv("EXCHANGE_RATE_API_KEY", "test-api-key")
    })

    afterEach(() => {
        vi.resetAllMocks()
        vi.unstubAllEnvs()
    })

    it("Debe devolver únicamente las tasas solicitadas con el formato normalizado", async () => {
        httpGetMock.mockResolvedValue({
            result: "success",
            base_code: "USD",
            time_last_update_unix:
                Date.parse("2026-11-25T00:00:00Z") / 1000,
            conversion_rates: {
                USD: 1,
                EUR: 0.92,
                ARS: 1400
            }
        })

        const result = await getExchangeRateApiRates(" usd ", ["eur"])

        expect(httpGetMock).toHaveBeenCalledWith(
            "https://v6.exchangerate-api.com/v6/test-api-key/latest/USD"
        )

        expect(result).toEqual([
            {
                base: "USD",
                quote: "EUR",
                rate: 0.92,
                date: "2026-11-25",
                provider: "exchange-rate-api"
            }
        ])
    })

    it("Debe rechazar la consulta si falta la API key sin contactar al proveedor", async () => {
        vi.stubEnv("EXCHANGE_RATE_API_KEY", "")

        await expect(
            getExchangeRateApiRates("USD", ["EUR"])
        ).rejects.toThrow(
            "La variable EXCHANGE_RATE_API_KEY no está configurada"
        )

        expect(httpGetMock).not.toHaveBeenCalled()
    })

    it("Debe rechazar una respuesta que indique un error del proveedor", async () => {
        httpGetMock.mockResolvedValue({
            result: "error",
            "error-type": "quota-reached"
        })

        await expect(
            getExchangeRateApiRates("USD", ["EUR"])
        ).rejects.toBeInstanceOf(ZodError)
    })

    it("Debe rechazar una respuesta que no incluya una moneda solicitada", async () => {
        httpGetMock.mockResolvedValue({
            result: "success",
            base_code: "USD",
            time_last_update_unix:
                Date.parse("2026-11-25T00:00:00Z") / 1000,
            conversion_rates: {
                USD: 1,
                EUR: 0.92
            }
        })

        await expect(
            getExchangeRateApiRates("USD", ["EUR", "ARS"])
        ).rejects.toThrow(
            "ExchangeRate-API no devolvió una tasa para ARS"
        )
    })
})