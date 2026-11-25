import { z } from "zod"
import { currencySchema } from "./fx.schema.js"

export const exchangeRateApiResponseSchema = z.object({
    result: z.literal("success"),
    base_code: currencySchema,
    time_last_update_unix: z.number().int().nonnegative().refine(
        (timestamp) =>
            Number.isFinite(new Date(timestamp * 1000).getTime()),
        {
            message: "Invalid exchange rate update timestamp"
        }
    ),
    conversion_rates: z.record(
        currencySchema,
        z.number().positive()
    )
})