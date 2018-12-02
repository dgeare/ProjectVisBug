import $ from 'blingblingjs'
import hotkeys from 'hotkeys-js'
import { getStyle, getSide, showHideSelected, keys } from '../utilities/'

console.log(`${keys().up.plus.cmd},${keys().down.plus.shift}`);//this pattern works also
// todo: show margin color
const key_events = keys().up.down.left.right.array()
  .reduce((events, event) => 
    events.comma[event].comma.alt.plus[event].comma.shift.plus[event].comma.shift.plus.alt.plus[event]
  , keys())
  .string()
  .substring(1)

const command_events = [
  keys().cmd.plus.up.string(),
  keys().cmd.plus.shift.plus.up.string(),
  keys().cmd.plus.down.string(),
  keys().cmd.plus.shift.plus.down.string()
].join()

export function Margin(selector) {
  hotkeys(key_events, (e, handler) => {
    if (e.cancelBubble) return
      
    e.preventDefault()
    pushElement($(selector), handler.key)
  })

  hotkeys(command_events, (e, handler) => {
    e.preventDefault()
    pushAllElementSides($(selector), handler.key)
  })

  return () => {
    hotkeys.unbind(key_events)
    hotkeys.unbind(command_events)
    hotkeys.unbind(keys().up.down.left.right.array().join()) // bug in lib?
  }
}

export function pushElement(els, direction) {
  els
    .map(el => showHideSelected(el))
    .map(el => ({ 
      el, 
      style:    'margin' + getSide(direction),
      current:  parseInt(getStyle(el, 'margin' + getSide(direction)), 10),
      amount:   direction.split('+').includes(keys().shift.string()) ? 10 : 1,
      negative: direction.split('+').includes(keys().alt.string()),
    }))
    .map(payload =>
      Object.assign(payload, {
        margin: payload.negative
          ? payload.current - payload.amount 
          : payload.current + payload.amount
      }))
    .forEach(({el, style, margin}) =>
      el.style[style] = `${margin < 0 ? 0 : margin}px`)
}

export function pushAllElementSides(els, keycommand) {
  const combo = keycommand.split('+')
  
  keys().up.down.left.right.array()
    .forEach(side => {
      let cur = keys();
      if (combo.includes(keys().shift.string()))  cur = cur.shift.plus
      if (combo.includes(keys().down.string()))   cur = cur.alt.plus
      pushElement(els, cur[side].string())
    });
}