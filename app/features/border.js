import hotkeys from 'hotkeys-js'
import { metaKey, getStyle, getStyles, getSide, showHideSelected } from '../utilities/'

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
    let step = 0;
    return async (...args) => {
      if(performance.now() - last < 100){
        // if(step++ % 10 == 0)
          mod++
      }else{
        mod = 1
        step = 0;
      }
      last = performance.now()
      console.log(mod)
      console.log(Math.log2(mod))
      fn.apply(ctx,  [...args,Math.floor(Math.log2(mod * 2))])

    }
  }

  hotkeys(key_events, accelerate((e, handler, mod) => {
    e.preventDefault();
    if(handler.key.includes('shift')){
      modifyRadius(visbug.selection(), handler.key, mod)
    }else{
      modifyWidth(visbug.selection(), handler.key, mod)
    }
    return
  }))

  hotkeys(command_events, accelerate((e, handler, mod) => {
    e.preventDefault();
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

      borderRadii[getSide(keys).toLowerCase()] += sign * mod

      el.style.borderRadius = `${borderRadii.top}px ${borderRadii.right}px ${borderRadii.bottom}px ${borderRadii.left}px`
    })
}

const modifyRadiiAll = (els, keys, mod) => {
  const sign = keys.includes('down') ? -1 : 1
  els.map(el => showHideSelected(el))
    .forEach(el => {

      const borderRadii = getBorderRadii(el)
      for(const k in borderRadii){
        borderRadii[k] += sign * mod
      }

      el.style.borderRadius = `${borderRadii.top}px ${borderRadii.right}px ${borderRadii.bottom}px ${borderRadii.left}px`
    })
}

const getCurrentBorder = (el) => {
  const [t,r,b,l] = getStyle(el, 'border-width').split(' ')
  console.log(t,r,b,l)
  return {
    topWidth : parseInt(getStyle(el, 'border-top-width')),
    leftWidth : parseInt(getStyle(el, 'border-left-width')),
    bottomWidth : parseInt(getStyle(el, 'border-bottom-width')),
    rightWidth : parseInt(getStyle(el, 'border-right-width')),
    style : getStyle(el, 'border-style'),
    color : getStyle(el, 'border-color')
  }
}

const getBorderWidths = el => {
  const [t,r,b,l] = getStyle(el, 'border-width').split(' ')
  const [top,right,bottom,left] = [t,r,b,l].map(function recursiveRetrieveValue(v,i,arr){
    if(arr[i] === undefined){
      //recursively retrieve the value at lower index as the browser condenses representation of the style
      return recursiveRetrieveValue(undefined,(i-1)>>1,arr);
    }
    return parseInt(arr[i]);
  })

  return { top, right, bottom, left }
}

const getBorderRadii = el => {
  const [t,r,b,l] = getStyle(el, 'border-radius').split(' ')
  const [top,right,bottom,left] = [t,r,b,l].map(function recursiveRetrieveValue(v,i,arr){
    if(arr[i] === undefined){
      //recursively retrieve the value at lower index as the browser condenses representation of the style
      return recursiveRetrieveValue(undefined,(i-1)>>1,arr);
    }
    return parseInt(arr[i]);
  })

  return { top, right, bottom, left }
}

const setStyleDefaultOrSolid = el => {
  const style = getStyle(el, 'border-style')
  el.style.borderStyle = style !== 'none' ? style : 'solid'
}
