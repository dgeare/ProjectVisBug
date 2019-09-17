import hotkeys from 'hotkeys-js'
import { metaKey, getStyle, getStyles, getSide, sideToCorner, showHideSelected, getBorderRadii, getBorderWidths } from '../utilities/'

const key_events = 'up,down,left,right'
  .split(',')
  .reduce((events, event) =>
    `${events},${event},alt+${event},shift+${event},shift+alt+${event}`
  , '')
  .substring(1)

const command_events = `${metaKey}+up,${metaKey}+alt+up,${metaKey}+shift+up,${metaKey}+shift+alt+up,
                        ${metaKey}+down,${metaKey}+alt+down,${metaKey}+shift+down,${metaKey}+shift+alt+down`

export function Border(visbug) {
  const accelerate = (fn, ctx = null) => {
    
    
    let last = 0
    let mod = 1
    return async (...args) => {
      console.log(performance.now() - last);
      last = performance.now();
      fn.apply(ctx,  [...args,1]);return;
      if(performance.now() - last < 100){
          mod++
      }else{
        mod = 1
      }
      last = performance.now()
      fn.apply(ctx,  [...args,Math.floor(Math.log2(mod * 2))])

    }
  }

  hotkeys(key_events, accelerate((e, handler, mod) => {
    e.preventDefault()
    if(handler.key.includes('shift')){
      modifyRadius(visbug.selection(), handler.key, mod)
    }else{
      modifyWidth(visbug.selection(), handler.key, mod)
    }
    return
  }))

  hotkeys(command_events, accelerate((e, handler, mod) => {
    e.preventDefault()
    if(handler.key.includes('shift')){
      modifyRadiiAll(visbug.selection(), handler.key, mod)
    }else{
      modifyWidthAll(visbug.selection(), handler.key, mod)
    }
  }))

  return () => {
    hotkeys.unbind(key_events)
    hotkeys.unbind(command_events)
    hotkeys.unbind('up,down,left,right')
  }
}


const modifyWidth = (els, keys, mod) => {
  const sign = keys.includes('alt') ? -1 : 1
  els.map(el => showHideSelected(el))
    .forEach(el => {

      const borderWidth = getBorderWidths(el)
      borderWidth[getSide(keys).toLowerCase()] += sign * mod

      el.style.borderWidth = `${borderWidth.top}px ${borderWidth.right}px ${borderWidth.bottom}px ${borderWidth.left}px`
      setStyleDefaultOrSolid(el)
    })
}

const modifyWidthAll = (els, keys) => {
  const sign = keys.includes('down') ? -1 : 1
  els.map(el => showHideSelected(el))
    .forEach(el => {
      const borderWidth = getBorderWidths(el)

      for(const k in borderWidth){
        borderWidth[k] += sign * 1
        borderWidth[k] = Math.max(borderWidth[k], 0)
      }

      el.style.borderWidth = `${borderWidth.top}px ${borderWidth.right}px ${borderWidth.bottom}px ${borderWidth.left}px`
      setStyleDefaultOrSolid(el)
    })
}

const modifyRadius = (els, keys, mod) => {
  const sign = keys.includes('alt') ? -1 : 1
  els.map(el => showHideSelected(el))
    .forEach(el => {

      const borderRadii = getBorderRadii(el)

      borderRadii[sideToCorner(getSide(keys))] += sign * mod

      el.style.borderRadius = `${borderRadii.topLeft}px ${borderRadii.topRight}px ${borderRadii.bottomRight}px ${borderRadii.bottomLeft}px`
    })
}

const modifyRadiiAll = (els, keys, mod) => {
  const sign = keys.includes('down') ? -1 : 1
  els.map(el => showHideSelected(el))
    .forEach(el => {

      const borderRadii = getBorderRadii(el)
      for(const k in borderRadii){
        borderRadii[k] += sign * mod
        borderRadii[k] = Math.max(borderRadii[k],0)
      }

      el.style.borderRadius = `${borderRadii.topLeft}px ${borderRadii.topRight}px ${borderRadii.bottomRight}px ${borderRadii.bottomLeft}px`
    })
}

const setStyleDefaultOrSolid = el => {
  const style = getStyle(el, 'border-style')
  el.style.borderStyle = style !== 'none' ? style : 'solid'
}
