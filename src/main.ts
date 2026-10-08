import './estilo.css'
import {
  calcular,
  crearEstado,
  establecerNumeroDeCuotas,
  establecerPrecioDeContado,
  establecerValorDeCadaCuota,
  limpiar,
} from './logica'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('No se encontró el contenedor de la aplicación.')
}

const estado = crearEstado()

app.innerHTML = `
  <main class="contenedor">
    <header class="encabezado">
      <p class="sobrelinea">Comprá con toda la información</p>
      <h1>Cuánto cuesta de verdad</h1>
      <p class="introduccion">
        Compará el precio de contado con lo que terminás pagando en cuotas.
      </p>
    </header>

    <form id="formulario" novalidate>
      <div class="campos">
        <label class="campo" for="precio-contado">
          <span>Precio de contado</span>
          <span class="entrada">
            <span aria-hidden="true">$</span>
            <input
              id="precio-contado"
              name="precio-contado"
              type="number"
              min="0"
              step="any"
              inputmode="decimal"
              placeholder="400"
              autocomplete="off"
            />
          </span>
        </label>

        <label class="campo" for="numero-cuotas">
          <span>Número de cuotas</span>
          <input
            id="numero-cuotas"
            name="numero-cuotas"
            type="number"
            min="1"
            step="1"
            inputmode="numeric"
            placeholder="12"
            autocomplete="off"
          />
        </label>

        <label class="campo" for="valor-cuota">
          <span>Valor de cada cuota</span>
          <span class="entrada">
            <span aria-hidden="true">$</span>
            <input
              id="valor-cuota"
              name="valor-cuota"
              type="number"
              min="0"
              step="any"
              inputmode="decimal"
              placeholder="40"
              autocomplete="off"
            />
          </span>
        </label>
      </div>

      <div class="acciones">
        <button class="boton boton-calcular" type="submit">Calcular</button>
        <button class="boton boton-limpiar" id="limpiar" type="button">
          Limpiar
        </button>
      </div>
    </form>

    <section id="salida" class="salida" aria-live="polite" aria-atomic="true"></section>
  </main>
`

const formulario = app.querySelector<HTMLFormElement>('#formulario')!
const precioContado = app.querySelector<HTMLInputElement>('#precio-contado')!
const numeroCuotas = app.querySelector<HTMLInputElement>('#numero-cuotas')!
const valorCuota = app.querySelector<HTMLInputElement>('#valor-cuota')!
const salida = app.querySelector<HTMLElement>('#salida')!

function actualizarCampo(
  campo: HTMLInputElement,
  actualizar: (valor: number | null) => boolean,
): void {
  const valor = campo.value === '' ? null : campo.valueAsNumber
  actualizar(valor)
  dibujarSalida()
}

function formatearDolares(valor: number): string {
  return new Intl.NumberFormat('es-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(valor)
}

function formatearPorcentaje(valor: number): string {
  return `${new Intl.NumberFormat('es', {
    maximumFractionDigits: 2,
  }).format(valor)} %`
}

function dibujarSalida(): void {
  if (estado.mensajeError) {
    salida.innerHTML = `
      <p class="aviso" role="alert">${estado.mensajeError}</p>
    `
    return
  }

  if (!estado.resultado) {
    salida.replaceChildren()
    return
  }

  const resultado = estado.resultado
  const claseResultado = resultado.pagaDeMas ? 'paga-de-mas' : 'no-paga-de-mas'
  const mensaje = resultado.pagaDeMas ? 'Pagás de más' : 'No pagás de más'

  salida.innerHTML = `
    <div class="resultado ${claseResultado}">
      <h2>${mensaje}</h2>
      <dl class="resumen">
        <div class="dato">
          <dt>Total pagado en cuotas</dt>
          <dd>${formatearDolares(resultado.totalEnCuotas)}</dd>
        </div>
        <div class="dato">
          <dt>Diferencia en dólares</dt>
          <dd>${formatearDolares(resultado.diferenciaEnDolares)}</dd>
        </div>
        <div class="dato">
          <dt>Diferencia en porcentaje</dt>
          <dd>${formatearPorcentaje(resultado.diferenciaEnPorcentaje)}</dd>
        </div>
      </dl>
    </div>
  `
}

precioContado.addEventListener('input', () =>
  actualizarCampo(precioContado, (valor) =>
    establecerPrecioDeContado(estado, valor),
  ),
)
numeroCuotas.addEventListener('input', () =>
  actualizarCampo(numeroCuotas, (valor) =>
    establecerNumeroDeCuotas(estado, valor),
  ),
)
valorCuota.addEventListener('input', () =>
  actualizarCampo(valorCuota, (valor) =>
    establecerValorDeCadaCuota(estado, valor),
  ),
)

formulario.addEventListener('submit', (evento) => {
  evento.preventDefault()
  calcular(estado)
  dibujarSalida()
})

app.querySelector<HTMLButtonElement>('#limpiar')!.addEventListener('click', () => {
  limpiar(estado)
  formulario.reset()
  dibujarSalida()
  precioContado.focus()
})
