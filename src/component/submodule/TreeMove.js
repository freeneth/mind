import MouseMove from './MouseMove.js'
import Style from '../../style.js'
import { DFPreTraversal } from '../../treeStore.js'

export default class TreeMove {
    constructor() {
        this.mouseMove = new MouseMove()
        this.treeStore = null
        this.targetid = ''
        this.id = ''
        this.tree = null
        this.act = TreeMove.NOOP
        this.divpos = null
    }

    save(treeStore, id, divpos) {
        this.treeStore = treeStore
        this.id = id
        this.tree = this.treeStore.getTree(this.id)
        this.divpos = divpos
    }

    set divPosition(divpos) {
        this.divpos = divpos
    }

    mousePostion(bbox) {
        return {
            x: bbox.x + this.divpos.x,
            y: bbox.y + this.divpos.y,
        }
    }

    get savedTree() {
        return this.tree
    }

    get action() {
        return this.act
    }

    saveTreePos(mouseX, mouseY) {
        const style = this.treeStore.getStyle(this.id)
        this.mouseMove.save({
            x: mouseX,
            y: mouseY,
        }, {
            x: style.bbox.x,
            y: style.bbox.y,
        })
    }

    treePos(mouseX, mouseY, scale=1) {
        return this.mouseMove.load({
            x: mouseX,
            y: mouseY,
        }, scale)
    }

    // find the id of tree that has smallest tree_bbox containing the point
    static treeBBoxID(point, store, startid) {
        function pointInTreeBBox(point, id) {
            const tree_bbox = store.getStyle(id).tree_bbox.toJS()
            return Style.pointInsideBBox(point, tree_bbox)
        }

        let sofar = startid
        const traverer = (tree)=>{
            const {id} = tree
            if (id !== startid && pointInTreeBBox(point, id)) {
                sofar = id
                if (store.getNodeExpand(id)) {
                    return true
                } else {
                    return false
                }
            } else {
                return true
            }
        }
        DFPreTraversal(store.forest, startid, traverer)
        return sofar
    }

    decideMoveAction(bbox, id, store, rootid) {
        this.targetid = ''
        this.act = TreeMove.NOOP

        const pcenter = this.mousePostion(bbox)
        const ptop = {
            x: pcenter.x,
            y: pcenter.y - bbox.height / 2,
        }
        const pbottom = {
            x: pcenter.x,
            y: pcenter.y + bbox.height / 2,
        }

        function treeBBoxID(id) {
            const point = pcenter
            const parentid = store.getTree(id).parentid
            if (parentid !== '') {
                const targetid = TreeMove.treeBBoxID(point, store, parentid)
                if (targetid === parentid) {
                    return treeBBoxID(parentid)
                } else {
                    return targetid
                }
            } else {
                return id
            }
        }

        function getBBox(id){
            return store.getStyle(id).bbox
        }

        function mayAttachChild(ids) {
            return ids.reduce((a, e)=>{
                const bbox = getBBox(e)
                const bboxjs = bbox.toJS()
                if (!a && bbox &&
                    Style.pointInsideBBox(pcenter, bboxjs)) {
                    return e
                } else {
                    return a
                }
            }, '')
        }
        function mayAttachBefore(ids) {
            return ids.reduce((a, e)=>{
                const bbox = getBBox(e)
                const bboxjs = bbox.toJS()
                if (!a && bbox &&
                    Style.pointInsideBBox(pbottom, bboxjs)) {
                    return e
                } else {
                    return a
                }
            }, '')
        }
        function mayAttachAfter(ids) {
            return ids.reduce((a, e)=>{
                const bbox = getBBox(e)
                const bboxjs = bbox.toJS()
                if (!a && bbox &&
                    Style.pointInsideBBox(ptop, bboxjs)) {
                    return e
                } else {
                    return a
                }
            }, '')
        }

        const tree_bbox_id = treeBBoxID(id)

        const fatherids = [tree_bbox_id].concat(store.getTree(tree_bbox_id).childrenid.toJS())
        const maybe_as_fatherid = mayAttachChild(fatherids)
        if (maybe_as_fatherid && maybe_as_fatherid !== this.id) {
            this.targetid = maybe_as_fatherid
            this.act = TreeMove.ATTACH_CHILD
            return
        }

        let siblingids = []
        if (tree_bbox_id !== rootid) {
            // can't add sibling to root
            siblingids.push(tree_bbox_id)
        }
        siblingids = siblingids.concat(store.getTree(tree_bbox_id).childrenid.toJS())
        const maybe_as_sibling_yonger_id = mayAttachBefore(siblingids)
        if (maybe_as_sibling_yonger_id && maybe_as_sibling_yonger_id !== this.id) {
            this.targetid = maybe_as_sibling_yonger_id
            this.act = TreeMove.ATTACH_BEFORE
            return
        }
        const maybe_as_sibling_elder_id = mayAttachAfter(siblingids)
        if (maybe_as_sibling_elder_id && maybe_as_sibling_elder_id !== this.id) {
            this.targetid = maybe_as_sibling_elder_id
            this.act = TreeMove.ATTACH_AFTER
            return
        }
        return
    }
}

TreeMove.NOOP = 'TM_NOOP'
TreeMove.ATTACH_CHILD = 'TM_ATTACH_CHILD'
TreeMove.ATTACH_BEFORE = 'TM_ATTACH_BEFORE'
TreeMove.ATTACH_AFTER = 'TM_ATTACH_AFTER'
