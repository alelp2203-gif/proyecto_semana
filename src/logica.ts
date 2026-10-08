// Límites y factores numéricos usados por la lógica.
export const CONFIG = {
  maximoCuotas: 36, // máximo de cuotas permitido, en cantidad
  minimoExclusivo: 0, // valor mínimo exclusivo para precios y cuotas, en dólares o cantidad
  multiplicadorPorcentaje: 100, // conversión de proporción a porcentaje, en puntos porcentuales
} as const

export type Resultado = {
  totalEnCuotas: number
  diferenciaEnDolares: number
  diferenciaEnPorcentaje: number
  pagaDeMas: boolean
}

export type Estado = {
  precioDeContado: number | null
  numeroDeCuotas: number | null
  valorDeCadaCuota: number | null
  resultado: Resultado | null
  mensajeError: string | null
}

export function crearEstado(): Estado {
  return {
    precioDeContado: null,
    numeroDeCuotas: null,
    valorDeCadaCuota: null,
    resultado: null,
    mensajeError: null,
  }
}

export function establecerPrecioDeContado(
  estado: Estado,
  precio: number | null,
): boolean {
  if (precio !== null && !Number.isFinite(precio)) return false

  estado.precioDeContado = precio
  estado.resultado = null
  estado.mensajeError = null
  return true
}

export function establecerNumeroDeCuotas(
  estado: Estado,
  cantidad: number | null,
): boolean {
  if (cantidad !== null && !Number.isFinite(cantidad)) return false

  estado.numeroDeCuotas = cantidad
  estado.resultado = null
  estado.mensajeError = null
  return true
}

export function establecerValorDeCadaCuota(
  estado: Estado,
  valor: number | null,
): boolean {
  if (valor !== null && !Number.isFinite(valor)) return false

  estado.valorDeCadaCuota = valor
  estado.resultado = null
  estado.mensajeError = null
  return true
}

export function calcular(estado: Estado): boolean {
  const precio = estado.precioDeContado
  const cantidad = estado.numeroDeCuotas
  const valorCuota = estado.valorDeCadaCuota

  if (precio === null || precio <= CONFIG.minimoExclusivo) {
    estado.resultado = null
    estado.mensajeError = 'Ingresá un precio de contado mayor que cero.'
    return false
  }

  if (
    cantidad === null ||
    !Number.isInteger(cantidad) ||
    cantidad <= CONFIG.minimoExclusivo ||
    cantidad > CONFIG.maximoCuotas
  ) {
    estado.resultado = null
    estado.mensajeError = `Ingresá un número entero de cuotas entre 1 y ${CONFIG.maximoCuotas}.`
    return false
  }

  if (valorCuota === null || valorCuota <= CONFIG.minimoExclusivo) {
    estado.resultado = null
    estado.mensajeError = 'Ingresá el valor de cada cuota, mayor que cero.'
    return false
  }

  const totalEnCuotas = cantidad * valorCuota
  const diferenciaEnDolares = totalEnCuotas - precio

  estado.resultado = {
    totalEnCuotas,
    diferenciaEnDolares,
    diferenciaEnPorcentaje:
      (diferenciaEnDolares / precio) * CONFIG.multiplicadorPorcentaje,
    pagaDeMas: diferenciaEnDolares > CONFIG.minimoExclusivo,
  }
  estado.mensajeError = null
  return true
}

export function limpiar(estado: Estado): boolean {
  estado.precioDeContado = null
  estado.numeroDeCuotas = null
  estado.valorDeCadaCuota = null
  estado.resultado = null
  estado.mensajeError = null
  return true
}
