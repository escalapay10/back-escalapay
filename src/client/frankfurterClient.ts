import { httpGet } from "../utils/httpClient.js"
import { fxRequestSchema } from "../schemas/fx.schema.js"
import {
    frankfurterResponseSchema
} from "../schemas/frankfurter.schema.js"
import type { FxRate } from "../types/fx.types.js"

const FRANKFURTER_RATES_URL = "https://api.frankfurter.dev/v2/rates"

export async function getFrankfurterRates(
    base: string,
    targets: string[]
): Promise<FxRate[]> {
    const request = fxRequestSchema.parse({
        base,
        targets
    })

    const requestedTargets = [...new Set(request.targets)]

    const url = new URL(FRANKFURTER_RATES_URL)

    url.searchParams.set("base", request.base)
    url.searchParams.set("quotes", requestedTargets.join(","))

    const response = await httpGet(url.toString())

    const rates = frankfurterResponseSchema.refine(
        (rows) =>
            rows.every(
                (row) =>
                    row.base === request.base &&
                    requestedTargets.includes(row.quote)
            ) &&
            requestedTargets.every(
                (target) => rows.some((row) => row.quote === target)
            ),
        {
            message: "Frankfurter devolvió pares de monedas inesperados o incompletos"
        }
    ).parse(response)

    return rates.map((entry) => ({
        base: entry.base,
        quote: entry.quote,
        rate: entry.rate,
        date: entry.date,
        provider: "frankfurter"
    }))
}