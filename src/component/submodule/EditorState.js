import Immutable from 'immutable'
import {TreeAttachIndicatorState} from '../TreeAttachIndicator.jsx'
import {PluginUIState} from '../PluginUI.jsx'
import UndoStore from './UndoStore.js'
import PasteBin from './PasteBin.js'

export const OBSERVE = 'OBSERVE'
export const OB_MENU = 'OB_MENU'
export const CANVAS_MOVE = 'CANVAS_MOVE'
export const TREE_EDIT = 'TREE_EDIT'
export const TE_MENU = 'TE_MENU'
export const TE_IMPORT = 'TE_IMPORT'
export const TE_CANVAS_MOVE = 'TE_CANVAS_MOVE'
export const TE_ATTACH_MOVE = 'TE_ATTACH_MOVE'
export const TE_INPUT_TEXT = 'TE_INPUT_TEXT'
export const TE_PLUGIN_UI = 'TE_PLUGIN_UI'

export const Coord = Immutable.Record({
    x: 0,
    y: 0,
})

export class CanvasState extends Immutable.Record({
    translate: new Coord({x: 100, y: 200}),
    scale: 1,
}){
    setTranslate(x, y) {
        return this.set('translate', new Coord({x, y}))
    }
    setScale(s) {
        return this.set('scale', s)
    }
}

export class ContextMenuState extends Immutable.Record({
    display: false,
    position: new Coord(),
    groups: Immutable.List(),
}) {
    setDisplay(display) {
        return this.set('display', display)
    }
    setPosition(position) {
        return this.set('position', position)
    }
    setGroups(groups) {
        return this.set('groups', groups)
    }
}

class ImportTreeDialogState extends Immutable.Record({
    title: '导入',
    display: false,
    targetid: '',
}) {
}

export default class EditorState extends Immutable.Record({
    readWrite: true,
    mode: OBSERVE,
    rootid: '',
    selected: '',
    canvas: new CanvasState(),
    attach: new TreeAttachIndicatorState(),
    inputText: '',
    inputActive: false,
    importTreeDialog: new ImportTreeDialogState(),
    contextMenu: new ContextMenuState(),
    undoStore: new UndoStore(),
    pasteBin: new PasteBin(),
    pluginUI: new PluginUIState(),
}){
    constructor({rootid, readWrite, pasteBin}) {
        if (readWrite) {
            super({
                rootid,
                readWrite,
                pasteBin,
                undoStore: new UndoStore(),
            })
        } else {
            super({
                rootid,
                readWrite,
            })
        }
    }
    get canUndo() {
        return this.readWrite && (this.mode === OBSERVE ||
            this.mode === OB_MENU ||
            this.mode === TREE_EDIT ||
            this.mode === TE_MENU) && this.undoStore.canUndo
    }
    get canRedo() {
        return this.readWrite && (this.mode === OBSERVE ||
            this.mode === OB_MENU ||
            this.mode === TREE_EDIT ||
            this.mode === TE_MENU) && this.undoStore.canRedo
    }
    get canCutTree() {
        return this.readWrite && this.mode === TREE_EDIT
    }

    setMode(mode) {
        return this.set('mode', mode)
    }
    setSelected(id) {
        return this.set('selected', id)
    }
    setHandlers(handlers) {
        return this.set('handlers', handlers)
    }
    setUndoStore(undoStore) {
        return this.set('undoStore', undoStore)
    }
    setPasteBin(pasteBin) {
        return this.set('pasteBin', pasteBin)
    }
    setCanvas(canvas) {
        return this.set('canvas', canvas)
    }
    setContextMenu(contextMenu) {
        return this.set('contextMenu', contextMenu)
    }
    setImportTreeDialog(importTreeDialog) {
        return this.set('importTreeDialog', importTreeDialog)
    }
    setAttach(attach) {
        return this.set('attach', attach)
    }
    setPluginUI(pluginUI) {
        return this.set('pluginUI', pluginUI)
    }
}

