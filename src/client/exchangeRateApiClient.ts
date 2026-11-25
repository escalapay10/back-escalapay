import { httpGet } from "../utils/httpClient.js"
import { fxRequestSchema } from "../schemas/fx.schema.js"
import {
    exchangeRateApiResponseSchema
} from "../schemas/exchangeRateApi.schema.js"
import type { FxRate } from "../types/fx.types.js"

const EXCHANGE_RATE_API_URL = "https://v6.exchangerate-api.com/v6"

export async function getExchangeRateApiRates(
    base: string,
    targets: string[]
): Promise<FxRate[]> {
    const request = fxRequestSchema.parse({
        base,
        targets
    })

    const requestedTargets = [...new Set(request.targets)]

    const apiKey = process.env.EXCHANGE_RATE_API_KEY?.trim()

    if (!apiKey) {
        throw new Error("EXCHANGE_RATE_API_KEY is not configured")
    }

    const url =
        `${EXCHANGE_RATE_API_URL}/${encodeURIComponent(apiKey)}` +
        `/latest/${request.base}`

    const response = await httpGet(url)

    const data = exchangeRateApiResponseSchema.refine(
        (value) => value.base_code === request.base,
        {
            message: "ExchangeRate-API returned an unexpected base currency",
            path: ["base_code"]
        }
    ).parse(response)

    const date = new Date(
        data.time_last_update_unix * 1000
    ).toISOString().slice(0, 10)

    return requestedTargets.map((target): FxRate => {
        const rate = data.conversion_rates[target]

        if (rate === undefined) {
            throw new Error(
                `ExchangeRate-API did not return a rate for ${target}`
            )
        }

        return {
            base: data.base_code,
            quote: target,
            rate,
            date,
            provider: "exchange-rate-api"
        }
    })
}