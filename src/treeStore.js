import Immutable from 'immutable'
import {StyleNode, default as Style} from './style.js'
import {createReducers} from './redux_helper.js'
import SyncState from './redux-sync-state/main.js'
import {takeLatest, put, select} from 'redux-saga/effects'
import {PluginNode, Tree as PluginTree, default as PluginSpace} from './pluginSpace.js'

export class Node extends Immutable.Record({
    title: '新主题',
    expand: true,
    pluginType: '',
    pluginKey: '',
}) {
}

export class Tree extends Immutable.Record({
    id: '',
    parentid: '',
    childrenid: new Immutable.List(),
    node: new Node(),
}) {
    static fromJS(object) {
        const node = new Node(object.node)
        const childrenid = new Immutable.List(object.childrenid)
        const {id, parentid} = object
        return new Tree({id, parentid, childrenid, node})
    }
}

export class TreeStore extends Immutable.Record({
    forest: new Immutable.Map(), //id -> Tree
    styles: new Immutable.Map(), //id -> StyleNode
    pluginStores: new Immutable.Map(), //pluginType -> id -> storage
}) {
    constructor(obj) {
        super(obj)
    }

    getTree(id) {
        return this.forest.get(id)
    }

    getNode(id) {
        return this.forest.getIn([id, 'node'])
    }

    getStyle(id) {
        return this.styles.get(id, new StyleNode())
    }

    getNodeExpand(id) {
        return this.getNode(id).expand
    }

    getPluginKey(id) {
        const {node} = this.getTree(id)
        if (node) {
            return node.pluginKey
        } else {
            return ''
        }
    }

    getPluginType(id) {
        const tree = this.getTree(id)
        if (!tree) {
            return ''
        }

        const {node} = tree
        if (node) {
            return node.pluginType
        } else {
            return ''
        }
    }

    getPluginNode(tree) {
        const key = this.getPluginKey(tree.id)
        if (!key) {
            return new PluginNode(tree)
        } else {
            const storage = this.pluginStores.get(key)
            const {node: {title}} = this.getTree(tree.id)
            const node = {
                id: tree.id,
                parentid: tree.parentid,
                childrenid: tree.childrenid,
                title,
                storage,
            }
            return new PluginNode(node)
        }
    }

    setPluginStore(id, store) {
        const key = this.getPluginKey(id)
        if (key) {
            return this.setIn(['pluginStores', key], store)
        } else {
            return this
        }
    }

    load(dump) {
        return this.update('forest', (f)=>{
            return f.merge(dump)
        })
    }

    bindPlugin(id, pluginType, pluginKey) {
        const title = this.getNode(id).title
        return this.setIn(['pluginStores', pluginKey], new Immutable.Map({'_title': title}))
            .setNode(id, {pluginType: pluginType, pluginKey, title: `${title}(${pluginType})`})
    }

    unbindPlugin(id, rootid) {
        const node = this.getNode(id)
        const storage = this.getIn(['pluginStores', node.pluginKey])
        return this.setNode(id, {pluginType: '', pluginKey: '', title: storage.get('_title')})
            .pluginStoresGC(rootid)
    }

    create(treeid, title) {
        let tree = new Tree({id: treeid})
        if (title) {
            tree = tree.setIn(['node', 'title'], title)
        }
        return this.update('forest', (f)=>{
            return f.set(treeid, tree)
        })
    }

    detach(treeid) {
        const parentid = this.forest.getIn([treeid, 'parentid'])
        if (!parentid) {
            // already detached
            return this
        } else {
            return this.update('forest', (t)=>{
                return t.withMutations((f)=> {
                    return f.updateIn([parentid, 'childrenid'], (l)=>{
                        const i = l.findIndex(e => e === treeid)
                        return l.delete(i)
                    }).setIn([treeid, 'parentid'], '')
                })
            })
        }
    }

    attachAsChild(treeid, targetid) {
        const detached = this.detach(treeid)
        return detached.update('forest', (t)=> {
            return t.withMutations((f)=>{
                f.setIn([treeid, 'parentid'], targetid)
                f.updateIn([targetid, 'childrenid'], (l)=>{
                    return l.push(treeid)
                })
            })
        })
    }

    attachAsSibling(treeid, targetid, before) {
        const parentid = this.forest.getIn([targetid, 'parentid'])
        if (!parentid) {
            console.warn('attach as sibling root')
            return this
        } else {
            return this.detach(treeid).update('forest', (t)=>{
                return t.withMutations((f)=>{
                    f.setIn([treeid, 'parentid'], parentid)
                    f.updateIn([parentid, 'childrenid'], (l)=>{
                        const index = before ? l.indexOf(targetid) : l.indexOf(targetid) + 1
                        return l.splice(index, 0, treeid)
                    })
                })
            })
        }
    }

    remove(treeid) {
        const children = this.descendents(treeid)
        return this.detach(treeid).update('forest', (t)=>{
            return t.withMutations((f)=>{
                children.forEach((child)=>{
                    f.delete(child)
                })
            })
        })
    }

    setNode(treeid, node) {
        return this.mergeIn(['forest', treeid, 'node'], node)
    }

    setStyle(treeid, style) {
        const tstyle = new StyleNode (style)
        return this.mergeIn(['styles', treeid], tstyle)
    }

    toggleNodeExpand(treeid, rootid) {
        return this.updateIn(['forest', treeid, 'node', 'expand'], (expand)=>!expand)
            .updateStyle(rootid)
    }

    paste(target, pieces) {
        let {forest} = this
        let r = this
        if (forest.get(target)) {
            forest = forest.withMutations((f)=>{
                // create new sub tree
                pieces.forEach((tree)=>{
                    f.set(tree.id, tree)
                })
            })
            // attach new sub tree
            const piecesRoot = pieces.get(0).id
            r = r.set('forest', forest)
            r = r.attachAsChild(piecesRoot, target)
        }
        return r
    }

    updateStyle(rootid) {
        const getBBoxes = (title, style) => {
            const textBBox = Style.textBBox(title, style)
            const rectBBox = Style.rectBBox(textBBox, style)
            const bbox = Style.groupBBox([textBBox, rectBBox])
            return {textDim: textBBox, rectDim: rectBBox, bbox}
        }

        const updateWithLevel = (styles, id, level, x, y) => {
            if (!this.forest.get(id)) {
                return styles
            }

            const {
                childrenid,
                node: {title, expand},
            } = this.forest.get(id)
            const styleTemp = Style.TreeOfLevel(level)
            const {textDim, rectDim, bbox} = getBBoxes(title, styleTemp)

            if (!childrenid.isEmpty() && expand) {
                const mh = styleTemp.margin.left + styleTemp.margin.right
                const mv = styleTemp.margin.top + styleTemp.margin.bottom
                const childX = x + bbox.width + mh
                const childY = y + mv
                let nbbox = bbox.merge({x, y})
                const {s, bboxes} = childrenid.reduce((a, e)=>{
                    const s = updateWithLevel(a.s, e, level + 1, childX, a.childY)
                    const tree_bbox = s.getIn([e, 'tree_bbox'], new StyleNode())
                    const childY = a.childY + tree_bbox.height + mv
                    return {s, bboxes: a.bboxes.concat([tree_bbox]), childY}
                }, {s: styles, bboxes: [nbbox], childY})
                // child calcuated
                let otree_bbox = Style.groupBBox(bboxes)
                otree_bbox = otree_bbox.update('height', (h)=> h += mv)
                const tree_bbox = otree_bbox.merge({x, y})
                nbbox = nbbox.update('y', (i) => i + (tree_bbox.height - nbbox.height)/2)
                const style = styleTemp.mergeDeep({textDim, rectDim, bbox: nbbox, tree_bbox})
                return s.set(id, style)
            } else {
                let tree_bbox = bbox.merge({x, y})
                const ns = {textDim, rectDim, bbox: tree_bbox, tree_bbox}
                const style = styleTemp.mergeDeep(ns)
                return styles.set(id, style)
            }
        }

        const alignRoot = (styles) => {
            const bbox = styles.getIn([rootid, 'bbox'])
            const [dx, dy] = [-bbox.x, -bbox.y]
            return styles.withMutations((ss)=>{
                const d = this.descendents(rootid, true)
                d.forEach((id)=>{
                    const style = ss.get(id).withMutations((s)=>{
                        s.updateIn(['bbox', 'x'], (x)=>x + dx)
                        s.updateIn(['bbox', 'y'], (x)=>x + dy)
                        s.updateIn(['tree_bbox', 'x'], (x)=>x + dx)
                        s.updateIn(['tree_bbox', 'y'], (x)=>x + dy)
                    })
                    ss.set(id, style)
                })
                return ss
            })
        }

        const tree = this.forest.get(rootid)
        if (!tree) {
            return this
        } else {
            const styles = updateWithLevel(new Immutable.Map(), rootid, 0, 0, 0)
            return this.set('styles', alignRoot(styles))
        }
    }

    subtree(id) {
        return Immutable.Map().withMutations((f)=>{
            DFPreTraversal(this.forest, id, (t)=>{
                f.set(t.get('id'), t)
                return true
            })
        })
    }

    descendents(id, useExpand=false){
        const r = []
        DFPreTraversal(this.forest, id, (t)=>{
            if(useExpand && !t.node.expand) {
                r.push(t.id)
                return false
            } else {
                r.push(t.id)
                return true
            }
        })
        return r
    }

    pluginStoresGC(rootid) {
        let usedStores = new Immutable.Map()
        DFPreTraversal(this.forest, rootid, (t)=>{
            const key = t.getIn(['node', 'pluginKey'])
            if (key) {
                const t = this.pluginStores.get(key)
                usedStores = usedStores.set(key, t)
            }
            return true
        })
        return this.set('pluginStores', usedStores)
    }

    toPluginSpace(rootid, selected, display) {
        let forest = new Immutable.Map()
        forest = forest.withMutations((f)=>{
            DFPreTraversal(this.forest, rootid, (t)=>{
                const tree = new PluginTree({
                    id: t.id,
                    parentid: t.parentid,
                    childrenid: t.childrenid,
                    hasPlugin: !!t.node.get('pluginKey'),
                })
                f.set(t.id, tree)
                return true
            })
        })
        return new PluginSpace({
            rootid,
            selected,
            forest,
            display,
        }, (id)=>{
            const tree = forest.get(id)
            if (tree) {
                return this.getPluginNode(tree)
            } else {
                return null
            }
        })
    }
}

// Depth-first Pre-order
// f: (tree, depth) => deeper
export function DFPreTraversal(forest, id, f, depth=0) {
    const t = forest.get(id)
    if (t) {
        const deeper = f(t, depth)
        const childrenid = forest.getIn([id, 'childrenid'])
        if (deeper && !childrenid.isEmpty()) {
            childrenid.forEach((e)=>{
                DFPreTraversal(forest, e, f, depth+1)
            })
        }
    }
}


const COMMIT = 'TREE_STORE/COMMIT'
const PULL = 'TREE_STORE/PULL'
const PUSH = 'TREE_STORE/PUSH'

const PULL_OK = 'TREE_STORE/PULL_OK'
const PULL_ERR = 'TREE_STORE/PULL_ERR'
const PUSH_OK = 'TREE_STORE/PUSH_OK'
const PUSH_ERR = 'TREE_STORE/PUSH_ERR'

export const actions = {
    commit: (store) => ({
        type: COMMIT,
        store,
    }),
    pull_ok: (id, store)=>({
        type: PULL_OK,
        id,
        store,
    }),
    pull_err: (info)=>({
        type: PULL_ERR,
        info,
    }),
    push_ok: ()=>({
        type: PUSH_OK,
    }),
    push_err: (info)=>({
        type: PUSH_ERR,
        info,
    }),
    cmd: {
        pull: (id, loader)=>({
            type: PULL,
            id,
            loader,
        }),
        push: (id, saver)=>({
            type: PUSH,
            id,
            saver,
        }),
    },
}

const reducer = createReducers({
    [COMMIT]: commit,
    [PULL_OK]: pull_ok,
    [PULL_ERR]: pull_err,
    [PUSH_OK]: push_ok,
    [PUSH_ERR]: push_err,
}, new TreeStore())

export default {
    actions,
    reducer,
    saga,
}

function commit(old, {store}) {
    return store
}

function pull_ok(old, {id, store}) {
    return store.updateStyle(id)
}

function pull_err(old, {info}) {
    console.error(info)
    alert('读取失败，可能是网络异常导致，请尝试刷新页面')
    return old
}

function push_ok(old) {
    return old
}

function push_err(old, {info}) {
    console.error(info)
    alert('保存失败，可能是网络异常导致，请尝试刷新页面')
    return old
}

function* pull({id, loader}) {
    const getStore = state=>(state.treeStore)
    const start = function (taskid) {
        console.info('reading', taskid)
        return loader(id)
    }
    const onOk = function*(taskid, json) {
        console.info('read', taskid)
        const store = yield select(getStore)
        const {forest, pluginStores} = parse(json)
        if (forest) {
            yield put(actions.pull_ok(id, store.withMutations((s)=>{
                s.set('forest', forest)
                s.set('pluginStores', pluginStores)
            })))
        } else {
            yield put(actions.pull_ok(id, store))
        }
    }
    const onError = function*(taskid, info) {
        console.info('read', taskid)
        yield put(actions.pull_err(info))
    }
    yield put(SyncState.actions.read('treeStore', start, onOk, onError))
}

function* push({id, saver}) {
    const getStore = state=>(state.treeStore)
    const store = yield select(getStore)
    const json = toJSON(store, id)
    const start = function(taskid) {
        console.info('writting', taskid)
        return saver(id, json)
    }
    const onOk = function*(taskid) {
        console.info('written', taskid)
        yield put(actions.push_ok())
    }
    const onError = function*(taskid, info) {
        console.info('write', taskid)
        yield put(actions.push_err(info))
    }
    yield put(SyncState.actions.write('treeStore', start, onOk, onError))
}

function* saga() {
    yield takeLatest(PULL, pull)
    yield takeLatest(PUSH, push)
}

export function toJSON(treeStore, id) {
    const version = 1
    const nforest = normalize(treeStore.forest, id)
    if (nforest) {
        return JSON.stringify({
            version,
            forest: nforest,
            pluginStores: treeStore.pluginStores,
        })
    } else {
        return ''
    }
}

function parse(json) {
    if (json) {
        const dump = JSON.parse(json)
        if (dump.version === 1) {
            const {forest, pluginStores} = dump
            const keys = Object.keys(forest)
            const f = new Immutable.Map().withMutations((f)=>{
                keys.forEach((key)=>{
                    f.set(key, Tree.fromJS(forest[key]))
                })
            })
            return {
                forest: f,
                pluginStores: Immutable.fromJS(pluginStores),
            }
        }
    }
    return {}
}

function normalize(forest, id) {
    const normalizeNode = (node)=>{
        const {
            title,
            expand,
            pluginType,
            pluginKey,
        } = node
        if (pluginType) {
            return {
                title,
                expand,
                pluginType,
                pluginKey,
            }
        } else {
            return {
                title,
                expand,
            }
        }
    }
    const tree = forest.get(id)
    if (!tree) {
        return null
    }
    const {node, parentid, childrenid} = tree
    if (childrenid.length === 0) {
        return {[id]: {
            id,
            node: normalizeNode(node),
            parentid,
            childrenid,
        }}
    } else {
        const f = {[id]: {
            id,
            node: normalizeNode(node),
            parentid,
            childrenid,
        }}
        childrenid.forEach((cid)=>{
            Object.assign(f, normalize(forest, cid))
        })
        return f
    }
}

