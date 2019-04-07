import $          from 'blingblingjs'
import hotkeys    from 'hotkeys-js'
import styles     from './vis-bug.element.css'

import {
  Handles, Label, Overlay, Gridlines,
  Hotkeys, Metatip, Ally, Distance, BoxModel,
} from '../'

import {
  Selectable, Moveable, Padding, Margin, EditText, Font,
  Flex, Search, ColorPicker, BoxShadow, HueShift, MetaTip,
  Guides, Screenshot, Position, Accessibility, draggable
} from '../../features/'

import { VisBugModel }              from './model'
import * as Icons                 from './vis-bug.icons'
import { provideSelectorEngine }  from '../../features/search'
import { metaKey }                from '../../utilities/'

export default class VisBug extends HTMLElement {
  constructor() {
    super()

    this.toolbar_model  = VisBugModel
    this._tutsBaseURL   = 'tuts' // can be set by content script
    this.$shadow        = this.attachShadow({mode: 'closed'})
  }

  connectedCallback() {
    if (!this.$shadow.innerHTML)
      this.setup()

    this.selectorEngine = Selectable()
    this.colorPicker    = ColorPicker(this.$shadow, this.selectorEngine)
    provideSelectorEngine(this.selectorEngine)
  }

  disconnectedCallback() {
    this.deactivate_feature()
    this.cleanup()
    this.cleanupDragHandle()
    this.selectorEngine.disconnect()
    hotkeys.unbind(
      Object.keys(this.toolbar_model).reduce((events, key) =>
        events += ',' + key, ''))
    hotkeys.unbind(`${metaKey}+/`)
  }

  setup() {
    this.$shadow.innerHTML = this.render()

    $('li[data-tool]', this.$shadow).on('click', e =>
      this.toolSelected(e.currentTarget) && e.stopPropagation())

    this.setupDragHandle()

    Object.entries(this.toolbar_model).forEach(([key, value]) =>
      hotkeys(key, e => {
        e.preventDefault()
        this.toolSelected(
          $(`[data-tool="${value.tool}"]`, this.$shadow)[0]
        )
      })
    )

    hotkeys(`${metaKey}+/,${metaKey}+.`, e =>
      this.$shadow.host.style.display =
        this.$shadow.host.style.display === 'none'
          ? 'block'
          : 'none')

    this.toolSelected($('[data-tool="guides"]', this.$shadow)[0])
  }

  setupDragHandle(){
    this.draggableState;
    this.paletteHandle = this.$shadow.querySelector('#palette_handle')
    //bind callback methods to instance for this context
    this._paletteEnterHandler = this._paletteEnterHandler.bind(this)
    this._paletteLeaveHandler = this._paletteLeaveHandler.bind(this)

    this.listenNextHandleEnter();
  }

  cleanupDragHandle(){
    this.paletteHandle.removeEventListener('mouseenter', this._paletteEnterHandler)
    this.paletteHandle.removeEventListener('mouseenter', this._paletteLeaveHandler)
    if(this.teardown) this.teardown()
  }

  listenNextHandleEnter(){
    this.paletteHandle.addEventListener('mouseenter',this._paletteEnterHandler, {once : true})
  }

  _paletteEnterHandler(e){
    //make tool palette draggable
    draggable(this, {
      callback : (e, state) => {
        //pass state to outer closure
        this.draggableState = state
        //adjust the tip cards appropriately
        if(this.getBoundingClientRect().left > window.innerWidth/2){
          this.setAttribute('right-side','')
        }else{
          this.removeAttribute('right-side')
        }
      },
      context:this
    })
    //listen for leave && ! in drag for teardown
    this.listenMouseLeaveTearDown()
  }

  listenMouseLeaveTearDown(){
    this.paletteHandle.addEventListener('mouseleave', this._paletteLeaveHandler)
  }

  _paletteLeaveHandler(e){
    if(this.draggableState && ! this.draggableState.mouse.down){
      //teardown draggable
      this.teardown()
      this.teardown = undefined
      //remove listener (self)
      this.paletteHandle.removeEventListener('mouseleave', this._paletteLeaveHandler)
      //setup next time mouse enters handle
      this.listenNextHandleEnter()
    }
  }

  cleanup() {
    const bye = [
      ...document.getElementsByTagName('visbug-hover'),
      ...document.getElementsByTagName('visbug-handles'),
      ...document.getElementsByTagName('visbug-label'),
      ...document.getElementsByTagName('visbug-gridlines'),
    ].forEach(el => el.remove())

    document.querySelectorAll('[data-pseudo-select=true]')
      .forEach(el =>
        el.removeAttribute('data-pseudo-select'))
  }

  toolSelected(el) {
    if (typeof el === 'string')
      el = $(`[data-tool="${el}"]`, this.$shadow)[0]

    if (this.active_tool && this.active_tool.dataset.tool === el.dataset.tool) return

    if (this.active_tool) {
      this.active_tool.attr('data-active', null)
      this.deactivate_feature()
    }

    el.attr('data-active', true)
    this.active_tool = el
    this[el.dataset.tool]()
  }

  render() {
    return `
      ${this.styles()}
      <visbug-hotkeys></visbug-hotkeys>
      <ol>
        <li id='palette_handle'><span id='handle_dot'></span></li>
        ${Object.entries(this.toolbar_model).reduce((list, [key, tool]) => `
          ${list}
          <li aria-label="${tool.label} Tool" aria-description="${tool.description}" aria-hotkey="${key}" data-tool="${tool.tool}" data-active="${key == 'g'}">
            ${tool.icon}
            ${this.demoTip({key, ...tool})}
          </li>
        `,'')}
      </ol>
      <ol colors>
        <li style="display: none;" class="color" id="foreground" aria-label="Text" aria-description="Change the text color">
          <input type="color" value="">
          ${Icons.color_text}
        </li>
        <li style="display: none;" class="color" id="background" aria-label="Background or Fill" aria-description="Change the background color or fill of svg">
          <input type="color" value="">
          ${Icons.color_background}
        </li>
        <li style="display: none;" class="color" id="border" aria-label="Border or Stroke" aria-description="Change the border color or stroke of svg">
          <input type="color" value="">
          ${Icons.color_border}
        </li>
      </ol>
    `
  }

  styles() {
    return `
      <style>
        ${styles}
      </style>
    `
  }

  demoTip({key, tool, label, description, instruction}) {
    return `
      <aside ${tool}>
        <figure>
          <img src="${this._tutsBaseURL}/${tool}.gif" alt="${description}" />
          <figcaption>
            <h2>
              ${label}
              <span hotkey>${key}</span>
            </h2>
            <p>${description}</p>
            ${instruction}
          </figcaption>
        </figure>
      </aside>
    `
  }

  move() {
    this.deactivate_feature = Moveable(this.selectorEngine)
  }

  margin() {
    this.deactivate_feature = Margin(this.selectorEngine)
  }

  padding() {
    this.deactivate_feature = Padding(this.selectorEngine)
  }

  font() {
    this.deactivate_feature = Font(this.selectorEngine)
  }

  text() {
    this.selectorEngine.onSelectedUpdate(EditText)
    this.deactivate_feature = () =>
      this.selectorEngine.removeSelectedCallback(EditText)
  }

  align() {
    this.deactivate_feature = Flex(this.selectorEngine)
  }

  search() {
    this.deactivate_feature = Search($('[data-tool="search"]', this.$shadow))
  }

  boxshadow() {
    this.deactivate_feature = BoxShadow(this.selectorEngine)
  }

  hueshift() {
    let feature = HueShift(this.colorPicker)
    this.selectorEngine.onSelectedUpdate(feature.onNodesSelected)
    this.deactivate_feature = () => {
      this.selectorEngine.removeSelectedCallback(feature.onNodesSelected)
      feature.disconnect()
    }
  }

  inspector() {
    this.deactivate_feature = MetaTip(this.selectorEngine)
  }

  accessibility() {
    this.deactivate_feature = Accessibility()
  }

  guides() {
    this.deactivate_feature = Guides()
  }

  screenshot() {
    this.deactivate_feature = Screenshot()
  }

  position() {
    let feature = Position()
    this.selectorEngine.onSelectedUpdate(feature.onNodesSelected)
    this.deactivate_feature = () => {
      this.selectorEngine.removeSelectedCallback(feature.onNodesSelected)
      feature.disconnect()
    }
  }

  get activeTool() {
    return this.active_tool.dataset.tool
  }

  set tutsBaseURL(url) {
    this._tutsBaseURL = url
    this.setup()
  }
}

customElements.define('vis-bug', VisBug)
