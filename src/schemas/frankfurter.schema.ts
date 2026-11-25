import { z } from "zod"

const currencySchema = z.string().regex(/^[A-Z]{3}$/)

export const frankfurterRequestSchema = z.object({
    base: z.string().trim().toUpperCase().pipe(currencySchema),
    targets: z.array(
        z.string().trim().toUpperCase().pipe(currencySchema)
    ).min(1)
}).refine(
    ({ base, targets }) => !targets.includes(base),
    {
        message: "Target currencies must differ from the base currency",
        path: ["targets"]
    }
)

const frankfurterRateSchema = z.object({
    date: z.iso.date(),
    base: currencySchema,
    quote: currencySchema,
    rate: z.number().positive()
})

export const frankfurterResponseSchema = z.array(
    frankfurterRateSchema
).min(1)