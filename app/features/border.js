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
  hotkeys(key_events, (e, handler) => {
    e.preventDefault();
    if(handler.key.includes('shift')){
      modifyRadius(visbug.selection(), handler.key)
    }else{
      modifyWidth(visbug.selection(), handler.key)
    }
  })

  hotkeys(command_events, (e, handler) => {
    e.preventDefault();
    modifyWidthAll(visbug.selection(), handler.key)
  })

  return () => {
    hotkeys.unbind(key_events)
    hotkeys.unbind(command_events)
    hotkeys.unbind('up,down,left,right')
  }
}


const modifyWidth = (els, keys) => {
  const sign = keys.includes('alt') ? -1 : 1
  els.map(el => showHideSelected(el))
    .forEach(el => {

      const borderWidth = getBorderWidths(el)

      borderWidth[getSide(keys).toLowerCase()] += sign * 1

      el.style.borderWidth = `${borderWidth.top}px ${borderWidth.right}px ${borderWidth.bottom}px ${borderWidth.left}px`
      setStyleDefaultOrSolid(el)
    })
}

const modifyWidthAll = (els, keys) => {
  const sign = keys.includes('alt') ? -1 : 1
  els.map(el => showHideSelected(el))
    .forEach(el => {
      const borderWidth = getBorderWidths(el)

      for(const k in borderWidth){
        borderWidth[k] += sign * 1
      }

      el.style.borderWidth = `${borderWidth.top}px ${borderWidth.right}px ${borderWidth.bottom}px ${borderWidth.left}px`
      setStyleDefaultOrSolid(el)
    })
}

const modifyRadius = (els, keys) => {
  const sign = keys.includes('alt') ? -1 : 1
  els.map(el => showHideSelected(el))
    .forEach(el => {

      const borderRadii = getBorderRadii(el)

      borderRadii[getSide(keys).toLowerCase()] += sign * 1

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
