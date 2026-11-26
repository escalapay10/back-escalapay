export class FxServiceError extends Error {
    public readonly code = "FX_PROVIDERS_UNAVAILABLE"

    constructor() {
        super("No se pudieron obtener los tipos de cambio de ninguno de los proveedores")
        this.name = "FxServiceError"
    }
}