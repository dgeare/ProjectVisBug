import $ from 'blingblingjs'
import hotkeys from 'hotkeys-js'
import { getStyle, getSide, showHideSelected, userKeys } from '../utilities/'

// todo: show padding color
const key_events = 'up,down,left,right'
  .split(',')
  .reduce((events, event) => 
    `${events},${event},alt+${event},shift+${event},shift+alt+${event}`
  , '')
  .substring(1)

const getCommandEvents = () => `${userKeys.cmd}+up,${userKeys.cmd}+shift+up,${userKeys.cmd}+down,${userKeys.cmd}+shift+down`

export function Padding(selector) {
  const command_events = getCommandEvents()
  hotkeys(key_events, (e, handler) => {
    if (e.cancelBubble) return
      
    e.preventDefault()
    padElement($(selector), handler.key)
  })

  hotkeys(command_events, (e, handler) => {
    e.preventDefault()
    padAllElementSides($(selector), handler.key)
  })

  return () => {
    hotkeys.unbind(key_events)
    hotkeys.unbind(command_events)
    hotkeys.unbind('up,down,left,right') // bug in lib?
  }
}

export function padElement(els, direction) {
  els
    .map(el => showHideSelected(el))
    .map(el => ({ 
      el, 
      style:    'padding' + getSide(direction),
      current:  parseInt(getStyle(el, 'padding' + getSide(direction)), 10),
      amount:   direction.split('+').includes('shift') ? 10 : 1,
      negative: direction.split('+').includes('alt'),
    }))
    .map(payload =>
      Object.assign(payload, {
        padding: payload.negative
          ? payload.current - payload.amount 
          : payload.current + payload.amount
      }))
    .forEach(({el, style, padding}) =>
      el.style[style] = `${padding < 0 ? 0 : padding}px`)
}

export function padAllElementSides(els, keycommand) {
  const combo = keycommand.split('+')
  let spoof = ''

  if (combo.includes('shift'))  spoof = 'shift+' + spoof
  if (combo.includes('down'))   spoof = 'alt+' + spoof

  'up,down,left,right'.split(',')
    .forEach(side => padElement(els, spoof + side))
}
