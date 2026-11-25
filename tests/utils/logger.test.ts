import { describe, it, expect, vi, afterEach } from "vitest"
import { logger } from "../../src/utils/logger.js"

describe("Logger", () => {

    afterEach(() => {
        vi.restoreAllMocks()
        vi.unstubAllEnvs()
    })

    it("Debe registrar un mensaje", () => {
        vi.stubEnv("LOG_LEVEL", "info")

        const spy = vi.spyOn(process.stdout, "write").mockReturnValue(true)

        logger.info("Servidor iniciado")

        expect(spy).toHaveBeenCalled()
    })

    it("Debe ignorar los niveles inferiores", () => {
        vi.stubEnv("LOG_LEVEL", "warn")

        const spy = vi.spyOn(process.stdout, "write").mockReturnValue(true)

        logger.info("Servidor iniciado")

        expect(spy).not.toHaveBeenCalled()
    })

    it("Debe ocultar información sensible", () => {
        vi.stubEnv("LOG_LEVEL", "info")

        const spy = vi.spyOn(process.stdout, "write").mockReturnValue(true)

        logger.info("Usuario registrado", { password: "123456" })

        expect(spy).toHaveBeenCalledWith(
            expect.stringContaining('"password":"[REDACTED]"')
        )
    })
})