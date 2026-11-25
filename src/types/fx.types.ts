export type FxProvider = "frankfurter" | "exchange-rate-api"

export interface FxRate {
    base: string
    quote: string
    rate: number
    date: string
    provider: FxProvider
}