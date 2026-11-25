import { z } from "zod"
import { currencySchema } from "./fx.schema.js"

const frankfurterRateSchema = z.object({
    date: z.iso.date(),
    base: currencySchema,
    quote: currencySchema,
    rate: z.number().positive()
})

export const frankfurterResponseSchema = z.array(
    frankfurterRateSchema
).min(1)