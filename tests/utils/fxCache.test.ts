import {
    describe,
    it,
    expect,
    vi,
    beforeEach,
    afterEach
} from "vitest"
import { fxCache } from "../../src/utils/fxCache.js"
import type { FxRate } from "../../src/types/fx.types.js"

const rates: FxRate[] = [
    {
        base: "EUR",
        quote: "USD",
        rate: 1.09,
        date: "2026-11-25",
        provider: "frankfurter"
    },
    {
        base: "EUR",
        quote: "ARS",
        rate: 1500,
        date: "2026-11-25",
        provider: "frankfurter"
    }
]

describe("Caché FX", () => {
    beforeEach(() => {
        vi.stubEnv("FX_CACHE_TTL_MS", "1000")
    })

    afterEach(() => {
        fxCache.clear()
        vi.unstubAllEnvs()
        vi.useRealTimers()
    })

    it("Debe guardar y recuperar las tasas de una consulta", () => {
        fxCache.set("EUR", ["USD", "ARS"], rates)

        const result = fxCache.get("EUR", ["USD", "ARS"])

        expect(result).toEqual(rates)
    })

    it("Debe dejar de devolver las tasas cuando vence su tiempo de validez", () => {
        vi.useFakeTimers()

        fxCache.set("EUR", ["USD", "ARS"], rates)

        expect(
            fxCache.get("EUR", ["USD", "ARS"])
        ).toEqual(rates)

        vi.advanceTimersByTime(1000)

        expect(
            fxCache.get("EUR", ["USD", "ARS"])
        ).toBeUndefined()
    })

    it("Debe reutilizar la misma entrada aunque cambie el orden de los destinos", () => {
        fxCache.set("EUR", ["USD", "ARS"], rates)

        const result = fxCache.get("EUR", ["ARS", "USD"])

        expect(result).toEqual(rates)
    })

    it("No debe devolver tasas para una combinación de monedas diferente", () => {
        fxCache.set("EUR", ["USD", "ARS"], rates)

        expect(
            fxCache.get("EUR", ["USD"])
        ).toBeUndefined()

        expect(
            fxCache.get("USD", ["EUR", "ARS"])
        ).toBeUndefined()
    })
})