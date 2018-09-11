import { KeyBinding } from './keyMap.js'
import { MenuItemState } from './component/ContextMenuGroup.jsx'

function getTooltip(keys) {
    return new KeyBinding(keys).tooltip()
}

export default {
    findRoot: new MenuItemState({
        title: '定位根节点',
        info: getTooltip(['Home']),
    }),
    addSiblingNodeAfter: new MenuItemState({
        title: '下方同级节点',
        info: getTooltip(['Enter']),
    }),
    addSiblingNodeBefore: new MenuItemState({
        title: '上方同级节点',
        info: getTooltip(['Alt', 'Enter']),
    }),
    addChildNode: new MenuItemState({
        title: '子级节点',
        info: getTooltip(['Tab']),
    }),
    removeNode: new MenuItemState({
        title: '删除',
        info: getTooltip(['Delete']),
    }),
    importTree: new MenuItemState({
        title: '导入',
        info: '',
    }),
    cutTree: new MenuItemState({
        title: '剪切',
        info: KeyBinding.isMac ?
            getTooltip(['Meta', 'X']) :
            getTooltip(['Control', 'X']),
    }),
    copyTree: new MenuItemState({
        title: '复制',
        info: KeyBinding.isMac ?
            getTooltip(['Meta', 'C']) :
            getTooltip(['Control', 'C']),
    }),
    pasteTree: new MenuItemState({
        title: '粘贴',
        info: KeyBinding.isMac ?
            getTooltip(['Meta', 'V']) :
            getTooltip(['Control', 'V']),
    }),
    undo: new MenuItemState({
        title: '撤销',
        info: KeyBinding.isMac ?
            getTooltip(['Meta', 'Z']) :
            getTooltip(['Control', 'Z']),
    }),
    redo: new MenuItemState({
        title: '重做',
        info: KeyBinding.isMac ?
            getTooltip(['Meta', 'Shift', 'Z']) :
            getTooltip(['Control', 'Shift', 'Z']),
    }),
}
