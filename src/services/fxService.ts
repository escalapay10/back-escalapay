import { ZodError } from "zod"
import { getFrankfurterRates, getExchangeRateApiRates } from "../client/index.js"
import { HttpClientError, FxServiceError } from "../errors/index.js"
import { fxRequestSchema } from "../schemas/fx.schema.js"
import { logger, fxCache } from "../utils/index.js"
import type { FxRate } from "../types/fx.types.js"

export async function getFxRates(
    base: string,
    targets: string[]
): Promise<FxRate[]> {
    const request = fxRequestSchema.parse({
        base,
        targets
    })

    const requestedTargets = [...new Set(request.targets)]

    const cachedRates = fxCache.get(
        request.base,
        requestedTargets
    )

    if (cachedRates) {
        return cachedRates
    }

    try {
        const rates = await getFrankfurterRates(
            request.base,
            requestedTargets
        )

        fxCache.set(request.base, requestedTargets, rates)

        return rates

    } catch (error) {
        if (
            !(error instanceof HttpClientError) &&
            !(error instanceof ZodError)
        ) {
            throw error
        }

        logger.warn("El proveedor principal falló; se intentará con el respaldo", {
            provider: "frankfurter",
            fallbackProvider: "exchange-rate-api",
            base: request.base,
            targets: requestedTargets,
            errorCode:
                error instanceof HttpClientError
                    ? error.code
                    : "INVALID_RESPONSE"
        })
    }

    try {
        const rates = await getExchangeRateApiRates(
            request.base,
            requestedTargets
        )

        fxCache.set(request.base, requestedTargets, rates)

        return rates
    } catch {
        logger.error("No se pudieron obtener tipos de cambio de ninguno de los proveedores", {
            providers: ["frankfurter", "exchange-rate-api"],
            base: request.base,
            targets: requestedTargets
        })

        throw new FxServiceError()
    }
}