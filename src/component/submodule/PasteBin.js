import Immutable from 'immutable'

export const NOOP = 'PASTEBIN/NOOP'
export const COPY = 'PASTEBIN/COPY'
export const CUT = 'PASTEBIN/CUT'
export const PASTE = 'PASTEBIN/PASTE'

import {DFPreTraversal} from '../../treeStore.js'
import Random from '../../random.js'

function convertSubTree(forest, id) {
    const list = []
    DFPreTraversal(forest, id, (t)=>{
        list.push(t)
        return true
    })
    const convertMap = {}
    list.forEach((tree)=>{
        convertMap[tree.id] = Random.string()
    })
    const convert = (old)=>convertMap[old]
    return Immutable.List().withMutations((l)=>{
        list.forEach((tree)=>{
            let t = tree.set('childrenid', tree.childrenid.map(convert))
            t = t.set('id', convert(t.id))
            t = t.set('parentid', convert(t.parentid), '')
            l.push(t)
        })
    })
}

// saves pieces of tree to be paste
export default class PasteBin extends Immutable.Record({
    op: NOOP,
    pieces: new Immutable.List(),
}) {
    get piecesRoot() {
        if (this.pieces.isEmpty()) {
            return ''
        } else {
            return this.pieces.get(0).id
        }
    }

    prepareCut(forest, id) {
        const op = CUT
        const pieces = convertSubTree(forest, id)
        return new PasteBin({
            op,
            pieces,
        })
    }

    prepareCopy(forest, id) {
        const op = COPY
        const pieces = convertSubTree(forest, id)
        return new PasteBin({
            op,
            pieces,
        })
    }

    clear() {
        return new PasteBin()
    }
}
