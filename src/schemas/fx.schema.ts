import { z } from "zod"

export const currencySchema = z.string().regex(/^[A-Z]{3}$/)

export const fxRequestSchema = z.object({
    base: z.string().trim().toUpperCase().pipe(currencySchema),
    targets: z.array(
        z.string().trim().toUpperCase().pipe(currencySchema)
    ).min(1)
}).refine(
    ({ base, targets }) => !targets.includes(base),
    {
        message: "Las monedas de destino deben ser distintas de la moneda base",
        path: ["targets"]
    }
)