import { describe, expect, it } from 'vitest'
import {
  calcular,
  crearEstado,
  establecerNumeroDeCuotas,
  establecerPrecioDeContado,
  establecerValorDeCadaCuota,
  limpiar,
} from '../src/logica'

describe('la lógica de cuánto cuesta de verdad', () => {
  it('inicia con los campos vacíos y sin resultado ni error', () => {
    expect(crearEstado()).toEqual({
      precioDeContado: null,
      numeroDeCuotas: null,
      valorDeCadaCuota: null,
      resultado: null,
      mensajeError: null,
    })
  })

  it('guarda los valores válidos de contado y cuotas', () => {
    const estado = crearEstado()

    expect(establecerPrecioDeContado(estado, 400)).toBe(true)
    expect(establecerNumeroDeCuotas(estado, 12)).toBe(true)
    expect(establecerValorDeCadaCuota(estado, 40)).toBe(true)
    expect(estado).toMatchObject({
      precioDeContado: 400,
      numeroDeCuotas: 12,
      valorDeCadaCuota: 40,
    })
  })

  it('rechaza valores no finitos sin cambiar los campos', () => {
    const estado = crearEstado()
    establecerPrecioDeContado(estado, 400)
    establecerNumeroDeCuotas(estado, 12)
    establecerValorDeCadaCuota(estado, 40)

    expect(establecerPrecioDeContado(estado, Number.NaN)).toBe(false)
    expect(establecerNumeroDeCuotas(estado, Number.POSITIVE_INFINITY)).toBe(
      false,
    )
    expect(establecerValorDeCadaCuota(estado, Number.NEGATIVE_INFINITY)).toBe(
      false,
    )
    expect(estado).toMatchObject({
      precioDeContado: 400,
      numeroDeCuotas: 12,
      valorDeCadaCuota: 40,
    })
  })

  it('no calcula si falta algún campo y explica qué corregir', () => {
    const estado = crearEstado()

    expect(calcular(estado)).toBe(false)
    expect(estado.resultado).toBeNull()
    expect(estado.mensajeError).toContain('precio de contado')

    establecerPrecioDeContado(estado, 400)
    expect(calcular(estado)).toBe(false)
    expect(estado.mensajeError).toContain('número entero de cuotas')

    establecerNumeroDeCuotas(estado, 12)
    expect(calcular(estado)).toBe(false)
    expect(estado.mensajeError).toContain('valor de cada cuota')
  })

  it.each([
    ['cero', 0],
    ['negativo', -1],
  ])('no calcula si el precio de contado es %s', (_caso, precio) => {
    const estado = crearEstado()
    establecerPrecioDeContado(estado, precio)
    establecerNumeroDeCuotas(estado, 12)
    establecerValorDeCadaCuota(estado, 40)

    expect(calcular(estado)).toBe(false)
    expect(estado.resultado).toBeNull()
    expect(estado.mensajeError).toContain('precio de contado')
  })

  it.each([
    ['cero', 0],
    ['negativo', -1],
    ['no entero', 1.5],
    ['mayor al máximo permitido', 37],
  ])('no calcula si el número de cuotas es %s', (_caso, cantidad) => {
    const estado = crearEstado()
    establecerPrecioDeContado(estado, 400)
    establecerNumeroDeCuotas(estado, cantidad)
    establecerValorDeCadaCuota(estado, 40)

    expect(calcular(estado)).toBe(false)
    expect(estado.resultado).toBeNull()
    expect(estado.mensajeError).toContain('número entero de cuotas')
  })

  it('no calcula si el valor de cada cuota es cero o negativo', () => {
    const estado = crearEstado()
    establecerPrecioDeContado(estado, 400)
    establecerNumeroDeCuotas(estado, 12)

    for (const valor of [0, -1]) {
      establecerValorDeCadaCuota(estado, valor)
      expect(calcular(estado)).toBe(false)
      expect(estado.resultado).toBeNull()
      expect(estado.mensajeError).toContain('valor de cada cuota')
    }
  })

  it('calcula el total y la diferencia cuando se paga de más', () => {
    const estado = crearEstado()
    establecerPrecioDeContado(estado, 400)
    establecerNumeroDeCuotas(estado, 12)
    establecerValorDeCadaCuota(estado, 40)

    expect(calcular(estado)).toBe(true)
    expect(estado).toMatchObject({
      resultado: {
        totalEnCuotas: 480,
        diferenciaEnDolares: 80,
        diferenciaEnPorcentaje: 20,
        pagaDeMas: true,
      },
      mensajeError: null,
    })
  })

  it.each([
    ['igualan', 10, 0, 0],
    ['son menores', 5, -60, -50],
  ])(
    'indica que no se paga de más cuando las cuotas %s el contado',
    (_caso, valorCuota, diferencia, porcentaje) => {
      const estado = crearEstado()
      establecerPrecioDeContado(estado, 120)
      establecerNumeroDeCuotas(estado, 12)
      establecerValorDeCadaCuota(estado, valorCuota)

      expect(calcular(estado)).toBe(true)
      expect(estado.resultado).toMatchObject({
        totalEnCuotas: 12 * valorCuota,
        diferenciaEnDolares: diferencia,
        diferenciaEnPorcentaje: porcentaje,
        pagaDeMas: false,
      })
      expect(estado.mensajeError).toBeNull()
    },
  )

  it('limpia los campos, el resultado y el error', () => {
    const estado = crearEstado()
    establecerPrecioDeContado(estado, 400)
    establecerNumeroDeCuotas(estado, 12)
    establecerValorDeCadaCuota(estado, 40)
    calcular(estado)

    expect(limpiar(estado)).toBe(true)
    expect(estado).toEqual(crearEstado())
  })

  it('permite completar el recorrido exitoso desde el inicio hasta el resultado', () => {
    const estado = crearEstado()
    expect(estado).toEqual(crearEstado())
    expect(establecerPrecioDeContado(estado, 400)).toBe(true)
    expect(establecerNumeroDeCuotas(estado, 12)).toBe(true)
    expect(establecerValorDeCadaCuota(estado, 40)).toBe(true)
    expect(calcular(estado)).toBe(true)
    expect(estado.resultado).toEqual({
      totalEnCuotas: 480,
      diferenciaEnDolares: 80,
      diferenciaEnPorcentaje: 20,
      pagaDeMas: true,
    })
  })
})
