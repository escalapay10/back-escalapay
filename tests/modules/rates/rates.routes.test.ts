import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import express from "express"
import request from "supertest"
import ratesRoutes from "../../../src/modules/rates/routes/rates.routes.js"
import { getFxRates } from "../../../src/services/fxService.js"
import { FxServiceError } from "../../../src/errors/index.js"
import jwt from "jsonwebtoken"

vi.mock("../../../src/services/fxService.js", () => ({
    getFxRates: vi.fn()
}))

const getFxRatesMock = vi.mocked(getFxRates)

const testSecret = "rates-test-secret"

const token = jwt.sign(
    { sub: "test-user-id" },
    testSecret,
    { expiresIn: "1h" }
)

const app = express()
app.use("/api/rates", ratesRoutes)

describe("Endpoint de tasas", () => {

    beforeEach(() => {
        vi.stubEnv("JWT_SECRET", testSecret)
    })

    afterEach(() => {
        vi.resetAllMocks()
        vi.unstubAllEnvs()
    })

    it("Debe devolver la tasa con el formato acordado", async () => {
        getFxRatesMock.mockResolvedValue([
            {
                base: "USD",
                quote: "ARS",
                rate: 1050.25,
                date: "2026-11-25",
                provider: "frankfurter"
            }
        ])

        const response = await request(app)
            .get("/api/rates")
            .set("Authorization", `Bearer ${token}`)
            .query({ from: "USD", to: "ARS" })

        expect(response.status).toBe(200)

        expect(response.body).toEqual({
            from: "USD",
            to: "ARS",
            rate: 1050.25,
            provider: "frankfurter",
            respondedAt: expect.any(String)
        })

        expect(getFxRatesMock).toHaveBeenCalledWith("USD", ["ARS"])
    })

    it("Debe rechazar monedas iguales sin consultar el servicio FX", async () => {
        const response = await request(app)
            .get("/api/rates")
            .set("Authorization", `Bearer ${token}`)
            .query({ from: "USD", to: "USD" })

        expect(response.status).toBe(400)

        expect(response.body).toEqual({
            message: expect.any(String),
            code: "VALIDATION_ERROR"
        })

        expect(getFxRatesMock).not.toHaveBeenCalled()
    })

    it("Debe responder con un error controlado si no se pueden obtener las tasas", async () => {
        getFxRatesMock.mockRejectedValue(new FxServiceError())

        const response = await request(app)
            .get("/api/rates")
            .set("Authorization", `Bearer ${token}`)
            .query({ from: "USD", to: "ARS" })

        expect(response.status).toBe(503)

        expect(response.body).toEqual({
            message: expect.any(String),
            code: "FX_PROVIDERS_UNAVAILABLE"
        })
    })

    it("Debe rechazar consultas sin token sin llamar al servicio FX", async () => {
        const response = await request(app)
            .get("/api/rates")
            .query({ from: "USD", to: "ARS" })

        expect(response.status).toBe(401)
        expect(getFxRatesMock).not.toHaveBeenCalled()
    })
})