import type { Request, Response, NextFunction } from "express"
import { ratesQuerySchema } from "../schemas/rates.schema.js"
import { getFxRates } from "../../../services/fxService.js"
import { FxServiceError } from "../../../errors/index.js"

export const getRates = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const validation = ratesQuerySchema.safeParse(req.query)

    if (!validation.success) {
        res.status(400).json({
            message: "Indicá monedas de origen y destino válidas y distintas",
            code: "VALIDATION_ERROR"
        })
        return
    }

    const { base, targets } = validation.data

    try {
        const [rate] = await getFxRates(base, targets)

        if (!rate) {
            throw new FxServiceError()
        }

        res.status(200).json({
            from: rate.base,
            to: rate.quote,
            rate: rate.rate,
            provider: rate.provider,
            respondedAt: new Date().toISOString()
        })
    } catch (error) {
        if (error instanceof FxServiceError) {
            res.status(503).json({
                message: "No se pudo obtener el tipo de cambio en este momento",
                code: error.code
            })
            return
        }

        next(error)
    }
}