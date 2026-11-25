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

    it("Debe ocultar la API key dentro de una URL de ExchangeRate-API", () => {
        vi.stubEnv("LOG_LEVEL", "info")

        const spy = vi.spyOn(process.stdout, "write").mockReturnValue(true)

        logger.info("Consulta externa", {
            url: "https://v6.exchangerate-api.com/v6/private-test-key/latest/USD"
        })

        expect(spy).toHaveBeenCalledWith(
            expect.stringContaining(
                "https://v6.exchangerate-api.com/v6/[REDACTED]/latest/USD"
            )
        )

        expect(spy).not.toHaveBeenCalledWith(
            expect.stringContaining("private-test-key")
        )
    })
})