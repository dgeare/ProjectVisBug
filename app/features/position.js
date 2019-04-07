import $ from 'blingblingjs'
import hotkeys from 'hotkeys-js'
import { metaKey, getStyle, getSide, showHideSelected } from '../utilities/'

const key_events = 'up,down,left,right'
  .split(',')
  .reduce((events, event) =>
    `${events},${event},alt+${event},shift+${event},shift+alt+${event}`
  , '')
  .substring(1)

const command_events = `${metaKey}+up,${metaKey}+shift+up,${metaKey}+down,${metaKey}+shift+down`

export function Position() {
  const state = {
    elements: []
  }

  hotkeys(key_events, (e, handler) => {
    if (e.cancelBubble) return

    e.preventDefault()
    positionElement(state.elements, handler.key)
  })

  const onNodesSelected = els => {
    state.elements.forEach(el =>
      el.teardown())

    state.elements = els.map(el =>
      draggable(el))
  }

  const disconnect = () => {
    state.elements.forEach(el => el.teardown())
    hotkeys.unbind(key_events)
    hotkeys.unbind('up,down,left,right')
  }

  return {
    onNodesSelected,
    disconnect,
  }
}

export function draggable(el, stateChange = {callback:() => {},context:null}) {
  const state = {
    mouse: {
      down: false,
      x: 0,
      y: 0,
    },
    element: {
      x: 0,
      y: 0,
    }
  }

  const setup = () => {
    el.style.transition   = 'none'
    el.style.cursor       = 'move'

    el.addEventListener('mousedown', onMouseDown, true)
    el.addEventListener('mouseup', onMouseUp, true)
    document.addEventListener('mousemove', onMouseMove, true)
  }

  const teardown = () => {
    el.style.transition   = null
    el.style.cursor       = null

    el.removeEventListener('mousedown', onMouseDown, true)
    el.removeEventListener('mouseup', onMouseUp, true)
    document.removeEventListener('mousemove', onMouseMove, true)
  }

  const onMouseDown = e => {
    e.preventDefault()
    stateChange.callback.call(stateChange.context, e, state);
    const el = e.target

    if(getComputedStyle(el).position == 'static')
      el.style.position = 'relative'
    el.style.willChange = 'top,left'

    if (el instanceof SVGElement) {
      const translate = el.getAttribute('transform')

      const [ x, y ] = translate
        ? extractSVGTranslate(translate)
        : [0,0]

      state.element.x  = x
      state.element.y  = y
    }
    else {
      state.element.x  = parseInt(getStyle(el, 'left'))
      state.element.y  = parseInt(getStyle(el, 'top'))
    }

    state.mouse.x      = e.clientX
    state.mouse.y      = e.clientY
    state.mouse.down   = true
  }

  const onMouseUp = e => {
    e.preventDefault()
    e.stopPropagation()
    stateChange.callback.call(stateChange.context, e, state);

    state.mouse.down = false
    el.style.willChange = null

    if (el instanceof SVGElement) {
      const translate = el.getAttribute('transform')

      const [ x, y ] = translate
        ? extractSVGTranslate(translate)
        : [0,0]

      state.element.x    = x
      state.element.y    = y
    }
    else {
      state.element.x    = parseInt(el.style.left) || 0
      state.element.y    = parseInt(el.style.top) || 0
    }
  }

  const onMouseMove = e => {
    e.preventDefault()
    e.stopPropagation()
    stateChange.callback.call(stateChange.context, e, state);

    if (!state.mouse.down) return

    if (el instanceof SVGElement) {
      el.setAttribute('transform', `translate(
        ${state.element.x + e.clientX - state.mouse.x},
        ${state.element.y + e.clientY - state.mouse.y}
      )`)
    }
    else {
      el.style.left = state.element.x + e.clientX - state.mouse.x + 'px'
      el.style.top  = state.element.y + e.clientY - state.mouse.y + 'px'
    }
  }

  setup()
  el.teardown = teardown

  return el
}

export function positionElement(els, direction) {
  els
    .map(el => ensurePositionable(el))
    .map(el => showHideSelected(el))
    .map(el => ({
        el,
        ...extractCurrentValueAndSide(el, direction),
        amount:   direction.split('+').includes('shift') ? 10 : 1,
        negative: determineNegativity(el, direction),
    }))
    .map(payload =>
      Object.assign(payload, {
        position: payload.negative
          ? payload.current + payload.amount
          : payload.current - payload.amount
      }))
    .forEach(({el, style, position}) =>
      el instanceof SVGElement
        ? setTranslateOnSVG(el, direction, position)
        : el.style[style] = position + 'px')
}

const extractCurrentValueAndSide = (el, direction) => {
  let style, current

  if (el instanceof SVGElement) {
    const translate = el.attr('transform')

    const [ x, y ] = translate
      ? extractSVGTranslate(translate)
      : [0,0]

    style   = 'transform'
    current = direction.includes('down') || direction.includes('up')
      ? y
      : x
  }
  else {
    const side = getSide(direction).toLowerCase()
    style = (side === 'top' || side === 'bottom') ? 'top' : 'left'
    current = getStyle(el, style)

    current === 'auto'
      ? current = 0
      : current = parseInt(current, 10)
  }

  return { style, current }
}

const extractSVGTranslate = translate =>
  translate.substring(
    translate.indexOf('(') + 1,
    translate.indexOf(')')
  ).split(',')
  .map(val => parseFloat(val))

const setTranslateOnSVG = (el, direction, position) => {
  const transform = el.attr('transform')
  const [ x, y ] = transform
    ? extractSVGTranslate(transform)
    : [0,0]

  const pos = direction.includes('down') || direction.includes('up')
    ? `${x},${position}`
    : `${position},${y}`

  el.attr('transform', `translate(${pos})`)
}

const determineNegativity = (el, direction) =>
  direction.includes('right') || direction.includes('down')

const ensurePositionable = el => {
  if (el instanceof HTMLElement)
    el.style.position = 'relative'
  return el
}
