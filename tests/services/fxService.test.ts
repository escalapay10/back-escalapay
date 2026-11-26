import { describe, it, expect, vi, afterEach } from "vitest"
import { ZodError } from "zod"
import { getFxRates } from "../../src/services/fxService.js"
import { getFrankfurterRates, getExchangeRateApiRates } from "../../src/client/index.js"
import { HttpClientError, FxServiceError } from "../../src/errors/index.js"
import { logger } from "../../src/utils/logger.js"
import type { FxRate } from "../../src/types/fx.types.js"

vi.mock("../../src/client/index.js", () => ({
    getFrankfurterRates: vi.fn(),
    getExchangeRateApiRates: vi.fn()
}))

vi.mock("../../src/utils/logger.js", () => ({
    logger: {
        warn: vi.fn(),
        error: vi.fn()
    }
}))

const frankfurterMock = vi.mocked(getFrankfurterRates)
const exchangeRateApiMock = vi.mocked(getExchangeRateApiRates)

describe("Servicio FX", () => {
    afterEach(() => {
        vi.resetAllMocks()
    })

    it("Debe devolver las tasas del proveedor principal sin consultar el respaldo", async () => {
        const rates: FxRate[] = [
            {
                base: "EUR",
                quote: "USD",
                rate: 1.09,
                date: "2026-11-25",
                provider: "frankfurter"
            }
        ]

        frankfurterMock.mockResolvedValue(rates)

        const result = await getFxRates(" eur ", ["usd", "USD"])

        expect(result).toEqual(rates)

        expect(frankfurterMock).toHaveBeenCalledExactlyOnceWith(
            "EUR",
            ["USD"]
        )

        expect(exchangeRateApiMock).not.toHaveBeenCalled()
    })

    it("Debe utilizar el respaldo y registrar una advertencia si falla el proveedor principal", async () => {
        const rates: FxRate[] = [
            {
                base: "EUR",
                quote: "USD",
                rate: 1.08,
                date: "2026-11-25",
                provider: "exchange-rate-api"
            }
        ]

        frankfurterMock.mockRejectedValue(
            new HttpClientError(
                "Se agotó el tiempo de espera",
                "TIMEOUT"
            )
        )

        exchangeRateApiMock.mockResolvedValue(rates)

        const result = await getFxRates("EUR", ["USD"])

        expect(result).toEqual(rates)

        expect(exchangeRateApiMock).toHaveBeenCalledExactlyOnceWith(
            "EUR",
            ["USD"]
        )

        expect(logger.warn).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                provider: "frankfurter",
                fallbackProvider: "exchange-rate-api",
                errorCode: "TIMEOUT"
            })
        )
    })

    it("Debe lanzar un error del servicio cuando fallan ambos proveedores", async () => {
        frankfurterMock.mockRejectedValue(
            new HttpClientError(
                "El proveedor no está disponible",
                "HTTP_ERROR",
                503
            )
        )

        exchangeRateApiMock.mockRejectedValue(
            new HttpClientError(
                "Falló la conexión con el proveedor",
                "NETWORK_ERROR"
            )
        )

        await expect(
            getFxRates("EUR", ["USD"])
        ).rejects.toBeInstanceOf(FxServiceError)

        expect(exchangeRateApiMock).toHaveBeenCalledOnce()
        expect(logger.error).toHaveBeenCalledOnce()
    })

    it("Debe rechazar una entrada inválida sin consultar proveedores ni registrar fallos", async () => {
        await expect(
            getFxRates("EUR", ["USD", "eur"])
        ).rejects.toBeInstanceOf(ZodError)

        expect(frankfurterMock).not.toHaveBeenCalled()
        expect(exchangeRateApiMock).not.toHaveBeenCalled()
        expect(logger.warn).not.toHaveBeenCalled()
        expect(logger.error).not.toHaveBeenCalled()
    })
})