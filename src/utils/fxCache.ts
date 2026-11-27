import type { FxCacheEntry, FxRate } from "../types/fx.types.js"

const DEFAULT_TTL_MS = 300000

const entries = new Map<string, FxCacheEntry>()

function createKey(base: string, targets: string[]): string {
    const sortedTargets = [...new Set(targets)].sort()

    return `${base}:${sortedTargets.join(",")}`
}

function getTtlMs(): number {
    const ttlMs = Number(process.env.FX_CACHE_TTL_MS ?? DEFAULT_TTL_MS)

    return Number.isFinite(ttlMs) && ttlMs > 0
        ? ttlMs
        : DEFAULT_TTL_MS
}

export const fxCache = {
    get(base: string, targets: string[]): FxRate[] | undefined {
        const key = createKey(base, targets)
        const entry = entries.get(key)

        if (!entry) return undefined

        if (entry.expiresAt <= Date.now()) {
            entries.delete(key)
            return undefined
        }

        return entry.rates.map((rate) => ({ ...rate }))
    },

    set(base: string, targets: string[], rates: FxRate[]): void {
        const now = Date.now()

        for (const [key, entry] of entries) {
            if (entry.expiresAt <= now) {
                entries.delete(key)
            }
        }

        entries.set(createKey(base, targets), {
            rates: rates.map((rate) => ({ ...rate })),
            expiresAt: now + getTtlMs()
        })
    },

    clear(): void {
        entries.clear()
    }
}