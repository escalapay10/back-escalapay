import { z } from "zod"
import { fxRequestSchema } from "../../../schemas/fx.schema.js"

export const ratesQuerySchema = z.object({
    from: z.string(),
    to: z.string()
}).transform(({ from, to }) => ({
    base: from,
    targets: [to]
})).pipe(fxRequestSchema)