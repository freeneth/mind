import React from 'react'
import Immutable from 'immutable'
/* eslint-disable no-unused-vars */
import { VLayout } from './Layout.jsx'
import Canvas from './SvgCanvas.jsx'
import ContextMenu from './ContextMenu.jsx'
import InputText from './InputText.jsx'
import TreeAttachIndicator from './TreeAttachIndicator.jsx'
import ImportTreeDialog from './ImportTreeDialog.jsx'
import ForestContainer from './ForestContainer.jsx'
import PluginUIContainer from './PluginUIContainer.jsx'
/* eslint-enable */
import styled from 'styled-components'
import Random from '../random.js'
import { KeyBinding, KeyMap } from '../keyMap.js'
import {
    Coord,
    ContextMenuState,
    CanvasState,
    OBSERVE,
    TREE_EDIT,
    OB_MENU,
    TE_MENU,
    TE_CANVAS_MOVE,
    TE_ATTACH_MOVE,
    TE_INPUT_TEXT,
    TE_PLUGIN_UI,
    TE_IMPORT,
    CANVAS_MOVE,
    default as EditorState,
} from './submodule/EditorState.js'
import MouseMove from './submodule/MouseMove.js'
import TreeMove from './submodule/TreeMove.js'
import {CUT} from './submodule/PasteBin.js'
import CMDef from '../ContextMenuDef.js'
import Outline from '../outline.js'
import {MenuItemState, MenuGroupState} from './ContextMenuGroup.jsx'
import {TreeAttachIndicatorState} from './TreeAttachIndicator.jsx'

/* eslint-disable no-unused-vars */
const FocusVLayout = styled(VLayout)`
    &:focus {
        outline: none;
    }
`
/* eslint-enable */

class MouseDownState extends Immutable.Record({
    pressed: false,
    onTree: '',
}) {
    setPressed(pressed) {
        return this.set('pressed', pressed)
    }
    setOnTree(id) {
        return this.set('onTree', id)
    }
}

class Handlers extends Immutable.Record({
    onMouseDownTree: null,
    onMouseUp: null,
    onMouseDownCanvas: null,
    onMouseDownExpand: null,
    onMouseMove: null,
    onKeyDown: null,
    onDoubleClickTree: null,
    onWheel: null,
    onInputTextBlur: null,
    onContextMenu: null,
    onContextMenuClose: null,
}) {
}

export class Editor extends React.Component {
    constructor(props) {
        super(props)
        const {
            readWrite,
            rootid,
        } = props
        this.state = {
            editor: new EditorState({
                rootid,
                readWrite,
            }),
        }
        this.mouseDown = new MouseDownState()
        this.canvasMove = new MouseMove()
        this.treeMove = new TreeMove()
        this.handlers = new Handlers()
        //bind functions:
        this.updateState = this.updateState.bind(this)
        this.saveTreeStore = this.saveTreeStore.bind(this)
        this.none = this.none.bind(this)
        this.ignore = this.ignore.bind(this)
        this.onContextMenu = this.onContextMenu.bind(this)
        this.onMouseDownExpand = this.onMouseDownExpand.bind(this)
        this.onMouseDownTree = this.onMouseDownTree.bind(this)
        this.onMouseUp = this.onMouseUp.bind(this)
        this.OBSERVE_onMouseDownCanvas = this.OBSERVE_onMouseDownCanvas.bind(this)
        this.OBSERVE_onMouseMove = this.OBSERVE_onMouseMove.bind(this)
        this.OBSERVE_onWheel = this.OBSERVE_onWheel.bind(this)
        this.onKeyDown = this.onKeyDown.bind(this)
        this.OB_MENU_ctx_Close = this.OB_MENU_ctx_Close.bind(this)
        this.OB_MENU_ctx_FindRoot = this.OB_MENU_ctx_FindRoot.bind(this)
        this.OB_MENU_ctx_Undo = this.OB_MENU_ctx_Undo.bind(this)
        this.OB_MENU_ctx_Redo = this.OB_MENU_ctx_Redo.bind(this)
        this.TE_MENU_ctx_Close = this.TE_MENU_ctx_Close.bind(this)
        this.TE_MENU_ctx_addChildNode = this.TE_MENU_ctx_addChildNode.bind(this)
        this.TE_MENU_ctx_addSiblingNodeAfter = this.TE_MENU_ctx_addSiblingNodeAfter.bind(this)
        this.TE_MENU_ctx_addSiblingNodeBefore = this.TE_MENU_ctx_addSiblingNodeBefore.bind(this)
        this.TE_MENU_ctx_removeNode = this.TE_MENU_ctx_removeNode.bind(this)
        this.TE_MENU_ctx_cutTree = this.TE_MENU_ctx_cutTree.bind(this)
        this.TE_MENU_ctx_copyTree = this.TE_MENU_ctx_copyTree.bind(this)
        this.TE_MENU_ctx_pasteTree = this.TE_MENU_ctx_pasteTree.bind(this)
        this.TE_MENU_ctx_importTree = this.TE_MENU_ctx_importTree.bind(this)
        this.CANVAS_MOVE_onMouseMove = this.CANVAS_MOVE_onMouseMove.bind(this)
        this.TREE_EDIT_onMouseDownTree = this.onMouseDownTree.bind(this)
        this.TREE_EDIT_onMouseDownCanvas = this.TREE_EDIT_onMouseDownCanvas.bind(this)
        this.TREE_EDIT_onMouseMove = this.TREE_EDIT_onMouseMove.bind(this)
        this.TE_CANVAS_MOVE_onMouseMove = this.TE_CANVAS_MOVE_onMouseMove.bind(this)
        this.TE_ATTACH_MOVE_onMouseMove = this.TE_ATTACH_MOVE_onMouseMove.bind(this)
        this.TE_IMPORT_onOK =this.TE_IMPORT_onOK.bind(this)
        this.TE_IMPORT_onClose =this.TE_IMPORT_onClose.bind(this)
        this.onDoubleClickTree = this.onDoubleClickTree.bind(this)
        this.onInputTextBlur = this.onInputTextBlur.bind(this)
        this.saveInputTextRef = this.saveInputTextRef.bind(this)

        this.ctxMenuFunc = {}
        this.keyMap = new KeyMap()

        this.genMutatePluginNodes = () => (nodes)=>{
            const {rootid} = this.state.editor
            let ts = this.props.treeStore
            ts = this.processPluginNodes(ts, nodes).updateStyle(rootid)
            this.closePluginUI()
            this.saveTreeStore(ts)
        }
    }

    componentDidMount() {
        this.updateState(this.OBSERVE(this.state.editor))
    }

    componentWillReceiveProps(newProps) {
        const {rootid, readWrite} = newProps
        if (rootid != this.props.rootid) {
            this.props.treeStoreCmd.pull(rootid)
            this.updateState(new EditorState({
                rootid,
                readWrite,
                pasteBin: this.state.editor.pasteBin,
            }))
        }
    }

    updateState(editor) {
        this.setState({editor})
    }

    saveTreeStore(store) {
        const {
            treeStoreCmd: {commit, push},
        } = this.props
        const {rootid} = this.state.editor
        commit(store)
        push(rootid)
    }

    processPluginNodes(treeStore, nodes) {
        console.log('mutating', nodes)
        if (nodes && nodes.length > 0) {
            return nodes.reduce((a, e)=>{
                if (e.storage) {
                    return a.setNode(e.id, {title: e.title})
                        .setPluginStore(e.id, e.storage)
                } else {
                    return a
                }
            }, treeStore)
        }
        return treeStore
    }

    setBasicKeyMap() {
        const { readWrite } = this.props
        this.keyMap.set(new KeyBinding(['Home']), 'home')
        if (readWrite) {
            if (KeyBinding.isMac) {
                this.keyMap.set(new KeyBinding(['Meta', 'Z']), 'undo')
                this.keyMap.set(new KeyBinding(['Meta', 'Shift', 'Z']), 'redo')
            } else {
                this.keyMap.set(new KeyBinding(['Control', 'Z']), 'undo')
                this.keyMap.set(new KeyBinding(['Control', 'Shift', 'Z']), 'redo')
            }
        }
    }

    setEditKeyMap() {
        const { readWrite } = this.props
        if (!readWrite) {
            return
        }
        this.keyMap.set(new KeyBinding(['ArrowLeft']), 'arrowLeft')
        this.keyMap.set(new KeyBinding(['ArrowRight']), 'arrowRight')
        this.keyMap.set(new KeyBinding(['ArrowUp']), 'arrowUp')
        this.keyMap.set(new KeyBinding(['ArrowDown']), 'arrowDown')
        this.keyMap.set(new KeyBinding(['Enter']), 'addSiblingNodeAfter')
        this.keyMap.set(new KeyBinding(['Alt', 'Enter']), 'addSiblingNodeBefore')
        this.keyMap.set(new KeyBinding(['Tab']), 'addChildNode')
        this.keyMap.set(new KeyBinding(['Insert']), 'addChildNode')
        this.keyMap.set(new KeyBinding([' ']), 'modifyInput')
        this.keyMap.set(new KeyBinding(['Delete']), 'removeNode')
        this.keyMap.set(new KeyBinding(['Backspace']), 'removeNode')
        if (KeyBinding.isMac) {
            this.keyMap.set(new KeyBinding(['Meta', 'X']), 'cut')
            this.keyMap.set(new KeyBinding(['Meta', 'C']), 'copy')
            this.keyMap.set(new KeyBinding(['Meta', 'V']), 'paste')
        } else {
            this.keyMap.set(new KeyBinding(['Control', 'X']), 'cut')
            this.keyMap.set(new KeyBinding(['Control', 'C']), 'copy')
            this.keyMap.set(new KeyBinding(['Control', 'V']), 'paste')
        }
    }

    setInputTextKeyMap() {
        const { readWrite } = this.props
        console.assert(readWrite)
        this.keyMap.set(new KeyBinding(['Enter']), 'confirmInput')
        this.keyMap.set(new KeyBinding(['Escape']), 'cancelInput')
    }

    OBSERVE(s) {
        this.handlers = this.handlers.merge({
            onMouseUp: this.onMouseUp,
            onMouseDownTree: this.onMouseDownTree,
            onMouseDownCanvas: this.OBSERVE_onMouseDownCanvas,
            onMouseDownExpand: this.onMouseDownExpand,
            onKeyDown: this.onKeyDown,
            onDoubleClickTree: this.onDoubleClickTree,
            onMouseMove: this.OBSERVE_onMouseMove,
            onWheel: this.OBSERVE_onWheel,
            onContextMenu: this.onContextMenu,
            onContextMenuClose: this.OB_MENU_ctx_Close,
        })
        this.keyMap = new KeyMap()
        this.setBasicKeyMap()
        return s.setMode(OBSERVE)
    }

    none() {
    }

    ignore(event) {
        event.stopPropagation()
        event.preventDefault()
    }

    onMouseDownTree(event, id) {
        event.stopPropagation()
        event.preventDefault()
        const {editor} = this.state
        const {readWrite} = this.props
        let mouseDown = this.mouseDown
        if (event.button === 0) {
            // left
            mouseDown = this.mouseDown.setPressed(true)
            if (readWrite) {
                mouseDown = mouseDown.setOnTree(id)
                let s = editor.setSelected(id)
                s = this.TREE_EDIT(s)
                this.updateState(s)
            }
        } else if (event.button === 2) {
            if (readWrite) {
                // right, only select
                let s = editor.setSelected(id)
                s = this.TREE_EDIT(s)
                this.updateState(s)
            }
        }
        this.mouseDown = mouseDown
    }

    onMouseUp(event) {
        event.preventDefault()
        event.stopPropagation()
        const {
            readWrite,
            treeStore,
            treeStoreCmd: {commit},
        } = this.props
        this.mouseDown = new MouseDownState()
        let s = this.state.editor
        if (event.button === 0) {
            if (s.mode === CANVAS_MOVE) {
                s = this.OBSERVE(s)
                this.updateState(s)
            } else if (s.mode === TE_CANVAS_MOVE) {
                console.assert(readWrite)
                s = this.TREE_EDIT(s)
                this.updateState(s)
            } else if (s.mode === TE_ATTACH_MOVE) {
                console.assert(readWrite)
                const node = this.treeMove.savedTree.node
                const store = treeStore.setNode(s.selected, node)
                const { attach_mode, targetid } = s.attach
                switch (attach_mode) {
                case TreeAttachIndicator.CHILD:
                    s = this.attachAsChild(s, store, targetid)
                    break
                case TreeAttachIndicator.BEFORE:
                    s = this.attachAsSibling(s, store, targetid, true)
                    break
                case TreeAttachIndicator.AFTER:
                    s = this.attachAsSibling(s, store, targetid, false)
                    break
                default:
                    commit(store.updateStyle(s.rootid))
                    break
                }
                this.treeMove.save(treeStore, '', null)
                const attach = new TreeAttachIndicatorState()
                s = s.setAttach(attach)
                s = this.TREE_EDIT(s)
                this.updateState(s)
            }
        }
    }

    OBSERVE_onMouseDownCanvas(event) {
        event.stopPropagation()
        if (event.button === 0) {
            this.mouseDown = this.mouseDown.setPressed(true)
        }
    }

    OBSERVE_onMouseMove(event) {
        const x = event.clientX
        const y = event.clientY
        const { pressed, onTree } = this.mouseDown
        const { editor: {rootid, canvas: {translate}}, editor} = this.state
        if (!onTree || onTree === rootid) {
            if (pressed) {
                this.canvasMove.save({ x, y }, translate)
                let s = this.CANVAS_MOVE(editor, x, y)
                this.updateState(s)
            }
        }
    }

    onKeyDown(event) {
        console.log('keyDown', event.key)
        let {editor: s} = this.state
        switch(this.keyMap.match(event)) {
        case 'home': {
            event.preventDefault()
            event.stopPropagation()
            s = this.repositionRoot(s)
            s = this.OBSERVE(s)
            break
        }
        case 'undo': {
            event.preventDefault()
            event.stopPropagation()
            s = this.undo(s)
            if (s.selected) {
                s = this.TREE_EDIT(s)
            }
            break
        }
        case 'redo': {
            event.preventDefault()
            event.stopPropagation()
            s = this.redo(s)
            if (s.selected) {
                s = this.TREE_EDIT(s)
            }
            break
        }
        case 'addSiblingNodeAfter': {
            event.preventDefault()
            event.stopPropagation()
            s = this.addSiblingNode(s)
            s = this.TREE_EDIT(s)
            break
        }
        case 'addSiblingNodeBefore': {
            event.preventDefault()
            event.stopPropagation()
            s = this.addSiblingNode(s, true)
            s = this.TREE_EDIT(s)
            break
        }
        case 'addChildNode': {
            event.preventDefault()
            event.stopPropagation()
            s = this.addChildNode(s)
            s = this.TREE_EDIT(s)
            break
        }
        case 'removeNode': {
            event.preventDefault()
            event.stopPropagation()
            if (this.canCutTree()) {
                s = this.removeNode(s)
            }
            s = this.TREE_EDIT(s)
            break
        }
        case 'arrowLeft': {
            event.preventDefault()
            event.stopPropagation()
            s = this.moveSelectedNode(s, 'ArrowLeft')
            s = this.TREE_EDIT(s)
            break
        }
        case 'arrowRight': {
            event.preventDefault()
            event.stopPropagation()
            s = this.moveSelectedNode(s, 'ArrowRight')
            s = this.TREE_EDIT(s)
            break
        }
        case 'arrowUp': {
            event.preventDefault()
            event.stopPropagation()
            s = this.moveSelectedNode(s, 'ArrowUp')
            s = this.TREE_EDIT(s)
            break
        }
        case 'arrowDown': {
            event.preventDefault()
            event.stopPropagation()
            s = this.moveSelectedNode(s, 'ArrowDown')
            s = this.TREE_EDIT(s)
            break
        }
        case 'cut': {
            event.preventDefault()
            event.stopPropagation()
            s = this.cutTree(s)
            s = this.TREE_EDIT(s)
            break
        }
        case 'copy': {
            event.preventDefault()
            event.stopPropagation()
            s = this.copyTree(s)
            s = this.TREE_EDIT(s)
            break
        }
        case 'paste': {
            event.preventDefault()
            event.stopPropagation()
            s = this.pasteTree(s)
            s = this.TREE_EDIT(s)
            break
        }
        case 'confirmInput': {
            event.preventDefault()
            event.stopPropagation()
            s = this.deactivateInputText(s)
            s = this.setNodeTitle(s, this.inputTextRef.innerText)
            break
        }
        case 'cancelInput': {
            event.preventDefault()
            event.stopPropagation()
            s = this.deactivateInputText(s)
            break
        }
        case 'modifyInput': {
            event.preventDefault()
            event.stopPropagation()
            const {treeStore} = this.props
            const {selected} = s
            if (!treeStore.getPluginType(selected)) {
                const {node} = treeStore.getTree(selected)
                s = this.activateInputText(s, node.title)
            }
            break
        }
        case 'closePluginUI': {
            event.preventDefault()
            event.stopPropagation()
            s = this.deactivatePluginUI(s)
            break
        }
        default: {
            const {treeStore} = this.props
            if (s.mode === TREE_EDIT &&
                !treeStore.getPluginType(s.selected) &&
                (KeyMap.isAlphanumeric(event) || KeyMap.isInputMethod(event))) {
                // TREE_EDIT -> TE_INPUT_TEXT when inputing text
                s = this.activateInputText(s)
                break
            }
            // do nothing
            return
        }}
        this.updateState(s)

    }

    onMouseDownExpand(event, id) {
        event.stopPropagation()
        event.preventDefault()
        const {
            readWrite,
            treeStore,
            treeStoreCmd: {commit, push},
        } = this.props
        let s = this.state.editor
        if (readWrite) {
            s = s.setSelected(id)
            s = this.TREE_EDIT(s)
        }
        const { rootid } = s
        let store = treeStore.toggleNodeExpand(id, rootid)
        store = store.updateStyle(rootid)
        commit(store)
        if (readWrite) {
            push(rootid)
        }
        this.updateState(s)
    }

    OBSERVE_onWheel(event) {
        event.preventDefault()
        const {editor} = this.state
        const translate = editor.canvas.translate
        this.canvasMove.save({ x: 0, y: 0 }, translate)
        const moved = this.canvasMove.load({ x: 0, y: -event.deltaY })
        const s = editor.update('canvas', (canvas)=>{
            return canvas.setTranslate(moved.x, moved.y)
        })
        this.updateState(s)
    }

    onContextMenu(event) {
        event.preventDefault()
        const position = new Coord({
            x: event.clientX,
            y: event.clientY,
        })
        if (this.state.editor.selected) {
            let s = this.TE_MENU(this.state.editor, position)
            this.updateState(s)
        } else {
            let s = this.OB_MENU(this.state.editor, position)
            this.updateState(s)
        }
    }

    OB_MENU(s, position) {
        this.ctxMenuFunc = {
            findRoot: this.OB_MENU_ctx_FindRoot,
            undo: this.OB_MENU_ctx_Undo,
            redo: this.OB_MENU_ctx_Redo,
        }
        this.handlers = this.handlers.merge({
            onContextMenu: this.ignore,
        })
        const {editor} = this.state
        const items = []
        if (editor.readWrite) {
            const { canUndo, canRedo } = editor
            const {
                findRoot,
                undo,
                redo} = this.ctxMenuFunc
            items.push(CMDef.findRoot.merge({
                onClick: findRoot,
            }))
            if (canUndo) {
                items.push(CMDef.undo.merge({
                    onClick: undo,
                }))
            }
            if (canRedo) {
                items.push(CMDef.redo.merge({
                    onClick: redo,
                }))
            }
        } else {
            const {
                findRoot,
            } = this.ctxMenuFunc
            items.push(CMDef.findRoot.merge({
                onClick: findRoot,
            }))
        }
        const treeG = new MenuGroupState({
            title: '脑图',
            items: Immutable.List(items),
        })
        s = s.setContextMenu(new ContextMenuState({
            display: true,
            position,
            groups: Immutable.List([
                treeG,
            ])},
        ))
        return s.setMode(OB_MENU)
    }

    OB_MENU_ctx_FindRoot() {
        const {editor} = this.state
        let s = this.repositionRoot(editor)
        s = this.hideContextMenu(s)
        s = this.OBSERVE(s)
        this.updateState(s)
    }

    OB_MENU_ctx_Undo() {
        const {editor} = this.state
        let s = this.undo(editor)
        s = this.hideContextMenu(s)
        if (s.selected) {
            s = this.TREE_EDIT(s)
        }
        this.updateState(s)
    }

    OB_MENU_ctx_Redo() {
        const {editor} = this.state
        let s = this.redo(editor)
        s = this.hideContextMenu(s)
        if (s.selected) {
            s = this.TREE_EDIT(s)
        }
        this.updateState(s)
    }

    OB_MENU_ctx_Close() {
        const {editor} = this.state
        let s = this.hideContextMenu(editor)
        s = this.OBSERVE(s)
        this.updateState(s)
    }

    build_TE_MENU_groups() {
        this.ctxMenuFunc = {
            addChildNode: this.TE_MENU_ctx_addChildNode,
            addSiblingNodeAfter: this.TE_MENU_ctx_addSiblingNodeAfter,
            addSiblingNodeBefore: this.TE_MENU_ctx_addSiblingNodeBefore,
            removeNode: this.TE_MENU_ctx_removeNode,
            cutTree: this.TE_MENU_ctx_cutTree,
            copyTree: this.TE_MENU_ctx_copyTree,
            pasteTree: this.TE_MENU_ctx_pasteTree,
            importTree: this.TE_MENU_ctx_importTree,
        }
        let groups = [
            this.build_TE_MENU_groups_attach(),
            this.build_TE_MENU_groups_edit(),
        ]
        const plugins = this.build_TE_MENU_ctx_plugins()
        if (plugins) {
            groups.push(plugins)
        }
        return Immutable.List(groups)
    }

    build_TE_MENU_ctx_plugins() {
        const {treeStore, allPlugins} = this.props
        const {rootid, selected} = this.state.editor
        const type = treeStore.getPluginType(selected)
        if (allPlugins.length === 0) {
            return null
        }
        if (type) {
            if (allPlugins.every((pi)=> pi.type !== type)) {
                //binded but without plugin
                return null
            }
            //binded and with the plugin
            const pi = allPlugins.find((pi)=> pi.type === type)
            const items = [
                new MenuItemState({
                    title: '解绑' + pi.name,
                    onClick: ()=>{
                        let {editor} = this.state
                        editor = this.saveSnapshot(editor)
                        let ts = treeStore
                        ts = ts.unbindPlugin(selected, rootid).updateStyle(rootid)
                        this.saveTreeStore(ts)
                        this.updateState(this.hideContextMenu(editor))
                    },
                }),
            ]
            return new MenuGroupState({
                title: '插件',
                items: Immutable.List(items),
            })
        } else {
            // select a plugin to bind
            const items = allPlugins.map((pi)=>{
                return new MenuItemState({
                    title: '绑定' + pi.name,
                    onClick: ()=>{
                        let {editor} = this.state
                        editor = this.saveSnapshot(editor)
                        const key = Random.string()
                        let ts = this.props.treeStore.bindPlugin(selected, pi.type, key).updateStyle(rootid)
                        this.saveTreeStore(ts)
                        let s = this.activatePluginUI(editor)
                        this.updateState(this.hideContextMenu(s))
                    },
                })
            })
            return new MenuGroupState({
                title: '插件',
                items: Immutable.List(items),
            })
        }
    }

    build_TE_MENU_groups_attach() {
        const {
            addChildNode,
            addSiblingNodeAfter,
            addSiblingNodeBefore,
        } = this.ctxMenuFunc
        const {editor, editor: {rootid}} = this.state
        let items = []
        items.push((CMDef.addChildNode.merge({
            onClick: addChildNode,
        })))
        if (editor.selected !== rootid) {
            items.push(CMDef.addSiblingNodeAfter.merge({
                onClick: addSiblingNodeAfter,
            }))
            items.push(CMDef.addSiblingNodeBefore.merge({
                onClick: addSiblingNodeBefore,
            }))
        }
        return new MenuGroupState({
            title: '新建',
            items: Immutable.List(items),
        })
    }

    build_TE_MENU_groups_edit() {
        const {
            removeNode,
            cutTree,
            copyTree,
            pasteTree,
            importTree,
        } = this.ctxMenuFunc
        let items = []
        if (this.canCutTree()) {
            items.push(CMDef.removeNode.merge({
                onClick: removeNode,
            }))
        }
        if (this.canCutTree()) {
            items.push(CMDef.cutTree.merge({
                onClick: cutTree,
            }))
        }
        if (this.canCopyTree()) {
            items.push(CMDef.copyTree.merge({
                onClick: copyTree,
            }))
        }
        if (this.canPasteTree()) {
            items.push(CMDef.pasteTree.merge({
                onClick: pasteTree,
            }))
        }
        if (this.canImportTree()) {
            items.push({
                title: '导入',
                info: '',
                onClick: importTree,
            })
        }

        return new MenuGroupState({
            title: '编辑',
            items: Immutable.List(items),
        })
    }

    TE_MENU(s, position) {
        this.handlers = this.handlers.merge({
            onInputTextBlur: this.none,
            onContextMenu: this.ignore,
        })
        s = s.setContextMenu(new ContextMenuState({
            display: true,
            position,
            groups: this.build_TE_MENU_groups(),
        }))
        return s.setMode(TE_MENU)
    }

    TE_MENU_ctx_Close() {
        const {editor} = this.state
        let s = this.hideContextMenu(editor)
        s = this.TREE_EDIT(s)
        this.updateState(s)
    }

    TE_MENU_ctx_addChildNode() {
        const {editor} = this.state
        let s = this.addChildNode(editor)
        s = this.hideContextMenu(s)
        s = this.TREE_EDIT(s)
        this.updateState(s)
    }

    TE_MENU_ctx_addSiblingNodeAfter() {
        const {editor} = this.state
        let s = this.addSiblingNode(editor)
        s = this.hideContextMenu(s)
        s = this.TREE_EDIT(s)
        this.updateState(s)
    }

    TE_MENU_ctx_addSiblingNodeBefore() {
        const {editor} = this.state
        let s = this.addSiblingNode(editor, true)
        s = this.hideContextMenu(s)
        s = this.TREE_EDIT(s)
        this.updateState(s)
    }

    TE_MENU_ctx_removeNode() {
        const {editor} = this.state
        let s = this.removeNode(editor)
        s = this.hideContextMenu(s)
        s = this.TREE_EDIT(s)
        this.updateState(s)
    }

    canCutTree() {
        const {mode, selected, rootid} = this.state.editor
        return mode === TREE_EDIT && selected !== rootid
    }

    TE_MENU_ctx_cutTree() {
        const {editor} = this.state
        let s = this.hideContextMenu(editor)
        s = this.cutTree(s)
        s = this.TREE_EDIT(s)
        this.updateState(s)
    }

    canCopyTree() {
        const {mode} = this.state.editor
        return mode === TREE_EDIT
    }

    TE_MENU_ctx_copyTree() {
        const {editor} = this.state
        let s = this.hideContextMenu(editor)
        s = this.copyTree(s)
        s = this.TREE_EDIT(s)
        this.updateState(s)
    }

    canPasteTree() {
        const {mode, pasteBin} = this.state.editor
        return mode === TREE_EDIT && !pasteBin.pieces.isEmpty()
    }

    TE_MENU_ctx_pasteTree() {
        const {editor} = this.state
        let s = this.hideContextMenu(editor)
        s = this.pasteTree(s)
        s = this.TREE_EDIT(s)
        this.updateState(s)
    }

    canImportTree() {
        const {mode} = this.state.editor
        return mode === TREE_EDIT
    }

    TE_MENU_ctx_importTree() {
        const {editor} = this.state
        let s = this.hideContextMenu(editor)
        s = this.TE_IMPORT(s)
        this.updateState(s)
    }

    CANVAS_MOVE(s, x, y) {
        s = s.setMode(CANVAS_MOVE)
        this.handlers = this.handlers.merge({
            onMouseMove: this.CANVAS_MOVE_onMouseMove,
        })
        return this.moveCanvas(s, x, y)
    }

    CANVAS_MOVE_onMouseMove(event) {
        const x = event.clientX
        const y = event.clientY
        let s = this.moveCanvas(this.state.editor, x, y)
        this.updateState(s)
    }

    TREE_EDIT(s) {
        this.handlers = this.handlers.merge({
            onMouseDownTree: this.onMouseDownTree,
            onMouseDownCanvas: this.TREE_EDIT_onMouseDownCanvas,
            onMouseMove: this.TREE_EDIT_onMouseMove,
            onMouseUp: this.onMouseUp,
            onMouseDownExpand: this.onMouseDownExpand,
            onKeyDown: this.onKeyDown,
            onDoubleClickTree: this.onDoubleClickTree,
            onInputTextBlur: this.onInputTextBlur,
            onContextMenu: this.onContextMenu,
            onContextMenuClose: this.TE_MENU_ctx_Close,
        })
        this.keyMap = new KeyMap()
        this.setBasicKeyMap()
        this.setEditKeyMap()

        return s.setMode(TREE_EDIT)
    }

    TREE_EDIT_onMouseMove(event) {
        const { treeStore } = this.props
        const x = event.clientX
        const y = event.clientY
        const { pressed, onTree } = this.mouseDown
        const { editor: {rootid, canvas: {translate}}, editor} = this.state
        if (!onTree || onTree === rootid) {
            if (pressed) {
                this.canvasMove.save({ x, y }, translate)
                let s = this.TE_CANVAS_MOVE(editor, x, y)
                this.updateState(s)
            }
        } else {
            if (pressed) {
                const rect = event.target.getBoundingClientRect()
                const divpos = {
                    x: x - rect.left,
                    y: y - rect.top,
                }
                this.treeMove.save(treeStore, onTree, divpos)
                this.treeMove.saveTreePos(x, y)
                let s = this.TE_ATTACH_MOVE(editor, x, y)
                this.updateState(s)
            }
        }
    }

    TREE_EDIT_onMouseDownCanvas(event) {
        event.stopPropagation()
        if (event.button === 0) {
            this.mouseDown = this.mouseDown.setPressed(true)
        }
    }

    TE_CANVAS_MOVE(s, x, y) {
        s = s.setMode(TE_CANVAS_MOVE)
        this.handlers = this.handlers.merge({
            onMouseMove: this.TE_CANVAS_MOVE_onMouseMove,
            onMouseDownTree: this.ignore,
            onMouseDownCanvas: this.ignore,
            onMouseDownExpand: this.ignore,
            onContextMenu: this.ignore,
        })
        return this.moveCanvas(s, x, y)
    }

    TE_CANVAS_MOVE_onMouseMove(event) {
        event.stopPropagation()
        const x = event.clientX
        const y = event.clientY
        let s = this.moveCanvas(this.state.editor, x, y)
        this.updateState(s)
    }

    TE_ATTACH_MOVE(s, x, y) {
        s = s.setMode(TE_ATTACH_MOVE)
        this.handlers = this.handlers.merge({
            onMouseDownTree: this.ignore,
            onMouseDownCanvas: this.ignore,
            onMouseDownExpand: this.ignore,
            onMouseMove: this.TE_ATTACH_MOVE_onMouseMove,
            onContextMenu: this.ignore,
        })
        return this.moveTree(s, x, y)
    }

    TE_ATTACH_MOVE_onMouseMove(event) {
        const x = event.clientX
        const y = event.clientY
        let s = this.moveTree(this.state.editor, x, y)
        this.updateState(s)
    }

    TE_INPUT_TEXT(s) {
        this.handlers = this.handlers.merge({
            onMouseDownTree: this.none,
            onMouseUp: this.none,
            onMouseDownCanvas: this.none,
            onMouseDownExpand: this.none,
            onMouseMove: this.none,
            onContextMenu: this.none,
        })
        this.keyMap = new KeyMap()
        this.setInputTextKeyMap()

        return s.setMode(TE_INPUT_TEXT)
    }

    TE_PLUGIN_UI(s) {
        this.handlers = this.handlers.merge({
            onMouseDownTree: this.none,
            onMouseUp: this.none,
            onMouseDownCanvas: this.none,
            onMouseDownExpand: this.none,
            onMouseMove: this.none,
            onInputTextBlur: this.ignore,
            onContextMenu: this.none,
        })
        this.keyMap = new KeyMap()
        this.keyMap.set(new KeyBinding(['Escape']), 'closePluginUI')
        return s.setMode(TE_PLUGIN_UI)
    }

    TE_IMPORT(s) {
        this.handlers = this.handlers.merge({
            onKeyDown: this.none,
            onInputTextBlur: this.none,
        })
        s = this.showImportTreeDialog(s)
        return s.setMode(TE_IMPORT)
    }

    showImportTreeDialog(s) {
        const importTreeDialog = s.importTreeDialog.set('display', true).set('targetid', s.selected)
        s = s.setImportTreeDialog(importTreeDialog)
        return s
    }

    hideImportTreeDialog(s) {
        const importTreeDialog = s.importTreeDialog.set('display', false)
        s = s.setImportTreeDialog(importTreeDialog)
        return s
    }

    TE_IMPORT_onOK(text) {
        let s = this.state.editor
        const {rootid, importTreeDialog: {targetid}} = s
        const to_import = Outline.toStore(text)
        const [import_root, store] = to_import
        if (import_root) {
            const {
                treeStore,
                treeStoreCmd: {commit, push},
            } = this.props
            let ts = treeStore.load(store.forest)
            ts = ts.attachAsChild(import_root, targetid).updateStyle(rootid)
            commit(ts)
            push(rootid)
            s = s.setSelected(to_import[0])
        }
        s = this.hideImportTreeDialog(s)
        s = this.TREE_EDIT(s)
        this.updateState(s)
    }

    TE_IMPORT_onClose() {
        let s = this.state.editor
        s = this.hideImportTreeDialog(s)
        s = this.TREE_EDIT(s)
        this.updateState(s)
    }

    onDoubleClickTree(event, id) {
        const {
            readWrite,
            treeStore,
        } = this.props
        if (readWrite) {
            if (event.button === 0) {
                let s = this.state.editor
                if (treeStore.getPluginType(id)) {
                    s = this.activatePluginUI(s)
                } else {
                    const {node} = treeStore.getTree(id)
                    s = this.activateInputText(s, node.title)
                }
                this.updateState(s)
            }
        }
    }

    repositionRoot(s) {
        return s.setCanvas(new CanvasState({scale: s.canvas.scale}))
    }

    hideContextMenu(s) {
        return s.setContextMenu(s.contextMenu.setDisplay(false))
    }

    moveCanvas(s, x, y) {
        const m = this.canvasMove.load({ x, y })
        return s.setCanvas(s.canvas.setTranslate(m.x, m.y))
    }

    moveTree(s, x, y) {
        let {
            treeStore,
            treeStoreCmd: {commit},
        } = this.props
        const { scale } = s.canvas
        const treePos = this.treeMove.treePos(x, y, scale)
        const id = s.selected
        const node = treeStore.getTree(s.selected).node.set('expand', false)
        treeStore = treeStore.setNode(id, node).updateStyle(s.rootid)
        const style = treeStore.getStyle(id)
        const ns = style.update('bbox', (bbox)=>bbox.merge(treePos))
        treeStore = treeStore.setStyle(id, ns)
        commit(treeStore)

        const bbox = treeStore.getStyle(id).bbox.toJS()
        this.treeMove.decideMoveAction(bbox, id, treeStore, s.rootid)

        let display = false
        let attach_mode
        switch (this.treeMove.action) {
        case TreeMove.ATTACH_CHILD:
            attach_mode = TreeAttachIndicator.CHILD
            display = true
            break
        case TreeMove.ATTACH_BEFORE:
            attach_mode = TreeAttachIndicator.BEFORE
            display = true
            break
        case TreeMove.ATTACH_AFTER:
            attach_mode = TreeAttachIndicator.AFTER
            display = true
            break
        default:
            attach_mode = TreeAttachIndicator.NOOP
        }

        const indicator = new TreeAttachIndicatorState({
            display,
            attach_mode,
            targetid: this.treeMove.targetid,
        })
        return s.setAttach(indicator)
    }

    setLocalNode(s, node) {
        const {
            treeStore,
            treeStoreCmd: {commit},
        } = this.props
        console.assert(s.readWrite)
        const id = s.selected
        commit(treeStore.setNode(id, node).updateStyle(s.rootid))
        return s
    }

    setLocalNodeStyle(s, style) {
        const {
            treeStore,
            treeStoreCmd: {commit},
        } = this.props
        console.assert(s.readWrite)
        const id = s.selected
        commit(treeStore.setStyle(id, style))
        return s
    }

    setNodeTitle(s, title) {
        console.assert(s.readWrite)
        const {
            treeStore,
            treeStoreCmd: {push, commit},
        } = this.props
        const {selected, rootid} = s
        let {node} = treeStore.getTree(selected)
        if (title && title !== node.title) {
            node = node.set('title', title)
            s = this.saveSnapshot(s)
            let store = treeStore.setNode(selected, node)
            store = store.updateStyle(rootid)
            commit(store)
            push(rootid)
        }
        return s
    }

    attachAsChild(s, treeStore, targetid) {
        const { rootid, selected } = s
        const {
            treeStoreCmd: {commit, push},
        } = this.props
        if (selected !== rootid) {
            s = this.saveSnapshot(s)
            let store = treeStore
            const expand = store.getNodeExpand(targetid)
            if (!expand) {
                store = store.toggleNodeExpand(targetid, rootid)
            }
            store = store.attachAsChild(selected, targetid)
            store = store.updateStyle(rootid)
            commit(store)
            push(rootid)
        }
        return s
    }

    attachAsSibling(s, treeStore, targetid, before) {
        const { rootid, selected } = s
        const {
            treeStoreCmd: {commit, push},
        } = this.props
        if (selected !== rootid) {
            let store = treeStore
            s = this.saveSnapshot(s)
            store = store.attachAsSibling(selected, targetid, before)
            store = store.updateStyle(rootid)
            commit(store)
            push(rootid)
        }
        return s
    }

    // state -> snapshot
    getSnapshot(s) {
        const { readWrite, rootid } = s
        console.assert(readWrite)
        const { treeStore } = this.props
        const sf = treeStore.subtree(rootid)
        const pluginStores = treeStore.pluginStores
        const ss = s.selected
        return Immutable.Map({
            forest: sf,
            selected: ss,
            pluginStores,
        })
    }

    // state, snapshot -> newState
    setSnapshot(s, snapshot) {
        const { readWrite, rootid } = s
        const {
            treeStore,
            treeStoreCmd: {commit, push},
        } = this.props
        console.assert(readWrite)
        const ss = snapshot.get('selected')
        s = s.setSelected(ss)
        const forest = snapshot.get('forest')
        let store = treeStore.remove(rootid)
        store = store.load(forest)
        store = store.updateStyle(rootid)
        store = store.set('pluginStores', (snapshot.get('pluginStores')))
        commit(store)
        push(rootid)
        return s
    }

    saveSnapshot(s) {
        const sn = this.getSnapshot(s)
        return s.setUndoStore(s.undoStore.snapshot(sn))
    }

    undo(s) {
        if (s.canUndo) {
            const old = s.undoStore.peekUndoStack()
            const sn = this.getSnapshot(s)
            s = this.setSnapshot(s, old)
            s = s.setUndoStore(s.undoStore.undo(sn))
        }
        return s
    }

    redo(s) {
        if (s.canRedo) {
            const old = s.undoStore.peekRedoStack()
            const sn = this.getSnapshot(s)
            s = this.setSnapshot(s, old)
            s = s.setUndoStore(s.undoStore.redo(sn))
        }
        return s
    }

    cutTree(s) {
        const {selected, readWrite, rootid} = s
        console.assert(readWrite)
        const {
            treeStore,
            treeStore: {forest},
            treeStoreCmd: {commit, push},
        } = this.props
        s = this.saveSnapshot(s)
        s = this.moveSelectedNode(s, 'ArrowLeft')
        s = s.setPasteBin(s.pasteBin.prepareCut(forest, selected))
        let store = treeStore.remove(selected)
        store = store.updateStyle(rootid)
        commit(store)
        push(rootid)
        return s
    }

    copyTree(s) {
        const {selected, readWrite} = s
        console.assert(readWrite)
        const {
            treeStore: {forest},
        } = this.props
        s = s.setPasteBin(s.pasteBin.prepareCopy(forest, selected))
        return s
    }

    pasteTree(s) {
        const {selected, readWrite, rootid} = s
        console.assert(readWrite)
        const {
            treeStore,
            treeStoreCmd: {commit, push},
        } = this.props
        if (s.pasteBin.pieces.isEmpty()) {
            return s
        } else {
            s = this.saveSnapshot(s)
            const expand = treeStore.getNodeExpand(selected)
            let store = treeStore
            if (!expand) {
                store = store.toggleNodeExpand(selected, rootid)
            }
            const piecesRoot = s.pasteBin.piecesRoot
            store = store.paste(selected, s.pasteBin.pieces)
            store = store.updateStyle(rootid)
            commit(store)
            if (s.pasteBin.op === CUT) {
                s = s.setPasteBin(s.pasteBin.clear())
            } else {
                s = s.setPasteBin(s.pasteBin.prepareCopy(store.forest, piecesRoot))
            }
            push(rootid)
            return s.setSelected(piecesRoot)
        }
    }

    addChildNode(s) {
        const { selected, rootid } = s
        const {
            treeStore,
            treeStoreCmd: {commit, push},
        } = this.props
        const expand = treeStore.getNodeExpand(selected)
        s = this.saveSnapshot(s)
        let store = treeStore
        if (!expand) {
            store = treeStore.toggleNodeExpand(selected, rootid)
        }
        const newid = Random.string()
        store = store.create(newid)
        store = store.setNode(newid)
        store = store.attachAsChild(newid, selected)
        store = store.updateStyle(rootid)
        commit(store)
        push(rootid)
        return s.setSelected(newid)
    }

    addSiblingNode(s, before=false) {
        const { selected, rootid } = s
        console.assert(selected !== rootid)
        const {
            treeStore,
            treeStoreCmd: {commit, push},
        } = this.props
        s = this.saveSnapshot(s)
        let store = treeStore
        const newid = Random.string()
        store = store.create(newid)
        store = store.setNode(newid)
        store = store.attachAsSibling(newid, selected, before)
        store = store.updateStyle(rootid)
        commit(store)
        push(rootid)
        return s.setSelected(newid)
    }

    removeNode(s) {
        const { selected, rootid } = s
        console.assert(selected !== rootid)
        const {
            treeStore,
            treeStoreCmd: {commit, push},
        } = this.props
        s = this.saveSnapshot(s)
        const parentid = treeStore.getTree(selected).parentid
        const parent = treeStore.getTree(parentid)
        const siblingids = parent.get('childrenid')
        if (siblingids.size <= 1) {
            s = this.moveSelectedNode(s, 'ArrowLeft')
        } else {
            const index = siblingids.findIndex(vid => {
                return vid === selected
            })
            if (index === 0) {
                s = this.moveSelectedNode(s, 'ArrowDown')
            } else {
                s = this.moveSelectedNode(s, 'ArrowUp')
            }
        }
        let store = treeStore.remove(selected)
        store = store.updateStyle(rootid)
        commit(store)
        push(rootid)
        return s
    }

    moveSelectedNode(s, direction) {
        const {
            treeStore,
            treeStoreCmd: {commit},
        } = this.props
        const {selected, rootid} = s
        const parentid = treeStore.getTree(selected).parentid
        switch(direction) {
        case 'ArrowUp':
        case 'ArrowDown':
            if (treeStore.getTree(parentid)) {
                const siblingids = treeStore.getTree(parentid).childrenid
                const index = siblingids.findIndex(vid => {
                    return vid === selected
                })
                const len = siblingids.size
                const ni = direction === 'ArrowUp' ? (index + len - 1)%len : (index + len + 1) % len
                s = s.setSelected(siblingids.get(ni))
            }
            break
        case 'ArrowLeft':
            if (parentid) {
                s = s.setSelected(parentid)
            }
            break
        case 'ArrowRight': {
            const {childrenid} = treeStore.getTree(selected)
            const expand = treeStore.getNodeExpand(selected)
            if (childrenid.size) {
                if (!expand) {
                    commit(treeStore.toggleNodeExpand(selected, rootid))
                }
                s = s.setSelected(childrenid.get(0))
            }
            break
        }}
        return s
    }

    activatePluginUI(s) {
        s = s.setPluginUI(s.pluginUI.setDisplay(true))
        return this.TE_PLUGIN_UI(s)
    }

    deactivatePluginUI(s) {
        s = s.setPluginUI(s.pluginUI.setDisplay(false))
        return this.TREE_EDIT(s)
    }

    closePluginUI() {
        let s = this.state.editor
        s = this.deactivatePluginUI(s)
        this.updateState(s)
    }

    activateInputText(s, text='') {
        s = s.merge({
            inputText: text,
            inputActive: true,
        })
        return this.TE_INPUT_TEXT(s)
    }

    deactivateInputText(s) {
        s = this.hideInputText(s)
        return this.TREE_EDIT(s)
    }

    closeInputText(text) {
        let s = this.state.editor
        s = this.deactivateInputText(s)
        s = this.setNodeTitle(s, text)
        this.updateState(s)
    }

    hideInputText(s) {
        return s.merge({
            inputText: '',
            inputActive: false,
        })
    }

    onInputTextBlur() {
        console.log('blur')
        let s = this.state.editor.merge({
            inputText: '',
            inputActive: false,
            selected: '',
        })
        s = this.OBSERVE(s)
        this.updateState(s)
    }

    saveInputTextRef(ref) {
        this.inputTextRef = ref
    }

    renderTree() {
        const { rootid, selected } = this.state.editor
        const handlers = {
            toggleExpand: this.handlers.onMouseDownExpand,
            onMouseDown: this.handlers.onMouseDownTree,
            onMouseUp: this.handlers.onMouseUp,
            onDoubleClick: this.handlers.onDoubleClickTree,
        }
        return (<ForestContainer rootid={rootid} selected={selected} handlers={handlers} />)
    }

    renderPluginUI() {
        const {
            treeStore,
            allPlugins,
        } = this.props
        const {rootid, selected, pluginUI} = this.state.editor
        const space = treeStore.toPluginSpace(rootid, selected, pluginUI.display)
        return (<PluginUIContainer space={space} allPlugins={allPlugins} mutate={this.genMutatePluginNodes()}/>)
    }

    render() {
        const { readWrite } = this.state.editor
        const {editor} = this.state
        if (readWrite) {
            const { treeStore } = this.props
            const tree = this.renderTree()
            const {canvas, contextMenu, importTreeDialog} = editor
            const inputTarget = treeStore.getTree(editor.selected)
            const inputTargetStyle = treeStore.getStyle(editor.selected)
            const indicator =(<TreeAttachIndicator
                display = {editor.attach.display}
                attach_mode = {editor.attach.attach_mode}
                targetid = {editor.attach.targetid}
                treeStore = {treeStore} />)
            const pluginUI = this.renderPluginUI()


            return (<FocusVLayout
                tabIndex="-1"
                onKeyDown={this.handlers.onKeyDown}
                onContextMenu={this.handlers.onContextMenu}
                style={Editor.styles.main}>
                <Canvas
                    scale={canvas.scale}
                    translate={canvas.translate}
                    onMouseDown={this.handlers.onMouseDownCanvas}
                    onMouseUp={this.handlers.onMouseUp}
                    onWheel={this.handlers.onWheel}
                    onMouseMove={this.handlers.onMouseMove}
                    onKeyDown={this.handlers.onKeyDown}
                >
                    {tree}
                    {indicator}
                </Canvas>
                {pluginUI}
                <InputText
                    ref={this.saveInputTextRef}
                    canvas={canvas}
                    target={inputTarget}
                    targetStyle={inputTargetStyle}
                    close={(text) => this.closeInputText(text)}
                    onBlur={this.handlers.onInputTextBlur}
                    active={editor.inputActive}
                    text={editor.inputText}
                >
                </InputText>
                <ContextMenu
                    display={contextMenu.display}
                    position={contextMenu.position}
                    groups={contextMenu.groups}
                    hide={this.handlers.onContextMenuClose}
                />
                <ImportTreeDialog
                    display={importTreeDialog.display}
                    title={importTreeDialog.title}
                    onOk={this.TE_IMPORT_onOK}
                    onClose={this.TE_IMPORT_onClose}
                />
            </FocusVLayout>)
        } else {
            const tree = this.renderTree()
            const {editor} = this.state
            const {canvas, contextMenu} = editor
            return (<FocusVLayout
                tabIndex="-1"
                onKeyDown={this.handlers.onKeyDown}
                onContextMenu={this.handlers.onContextMenu}
                style={Editor.styles.main}>
                <Canvas
                    scale={canvas.scale}
                    translate={canvas.translate}
                    onMouseDown={this.handlers.onMouseDownCanvas}
                    onMouseUp={this.handlers.onMouseUp}
                    onWheel={this.handlers.onWheel}
                    onMouseMove={this.handlers.onMouseMove}
                    onKeyDown={this.handlers.onKeyDown}
                >
                    {tree}
                </Canvas>
                <ContextMenu
                    display={contextMenu.display}
                    position={contextMenu.position}
                    groups={contextMenu.groups}
                    hide={this.handlers.onContextMenuClose}
                />
            </FocusVLayout>)
        }
    }
}

Editor.styles = {
    main: {
        position: 'relative',
        borderStyle: 'none',
        width: '100%',
        height: '100%',
    },
}

export class ReadWriteEditor extends React.PureComponent {
    render() {
        return (<Editor readWrite={true} {...this.props}></Editor>)
    }
}

export class ReadOnlyEditor extends React.PureComponent {
    render() {
        return (<Editor readWrite={false} {...this.props}></Editor>)
    }
}
