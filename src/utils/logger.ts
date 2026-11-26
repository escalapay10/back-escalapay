export type Level = "debug" | "info" | "warn" | "error"

const ORDER: Record<Level, number> = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40
}

const SENSITIVE_KEYS =
    /password|token|secret|authorization|api_key|apiKey|card_number|cardNumber|cvv|iban/i

const EXCHANGE_RATE_API_KEY_URL =
    /(https:\/\/v6\.exchangerate-api\.com\/v6\/)[^/\s?#]+/gi

function sanitizeText(value: string): string {
    return value.replace(
        EXCHANGE_RATE_API_KEY_URL,
        "$1[REDACTED]"
    )
}

function serializeLog(value: unknown): string {
    const seen = new WeakSet<object>()

    return JSON.stringify(value, (key, current) => {
        if (SENSITIVE_KEYS.test(key)) {
            return "[REDACTED]"
        }

        if (typeof current === "string") {
            return sanitizeText(current)
        }

        if (typeof current === "bigint") {
            return current.toString()
        }

        if (current instanceof Error) {
            return {
                name: current.name,
                message: current.message,
                stack: current.stack
            }
        }

        if (typeof current === "object" && current !== null) {
            if (seen.has(current)) return "[Circular]"
            seen.add(current)
        }

        return current
    })
}

function writeLog(
    level: Level,
    message: string,
    context: Record<string, unknown> = {}
): void {
    const min = process.env.LOG_LEVEL ?? "info"

    if (min === "silent") return

    if (ORDER[level] < (ORDER[min as Level] ?? ORDER.info)) return

    const line = {
        ts: new Date().toISOString(),
        level,
        message,
        context
    }

    let output: string

    try {
        output = serializeLog(line) + "\n"
    } catch {
        output = JSON.stringify({
            ts: new Date().toISOString(),
            level,
            message: "No se pudo serializar el registro"
        }) + "\n"
    }

    if (level === "error" || level === "warn") {
        process.stderr.write(output)
    } else {
        process.stdout.write(output)
    }
}

export const logger = {
    debug: (message: string, context?: Record<string, unknown>) =>
        writeLog("debug", message, context),

    info: (message: string, context?: Record<string, unknown>) =>
        writeLog("info", message, context),

    warn: (message: string, context?: Record<string, unknown>) =>
        writeLog("warn", message, context),

    error: (message: string, context?: Record<string, unknown>) =>
        writeLog("error", message, context)
}