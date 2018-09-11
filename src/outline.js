import Immutable from 'immutable'
import { DFPreTraversal, TreeStore } from './treeStore.js'
import Random from './random.js'

export default class Outline {
    static fromTreeStore(treeStore, rootid) {
        let s = ''
        function traverer(tree, depth) {
            const title = tree.node.title
            Immutable.Range(0, depth).forEach(()=>{
                s += '\t'
            })
            s += title
            s += '\n'
            return true
        }
        DFPreTraversal(treeStore.forest, rootid, traverer)
        return s
    }

    static _nodeListToTreeStore(nl) {
        let treeStore = new TreeStore()
        const lastOfDepth = {}
        let rootid
        nl.forEach((n)=>{
            const {title, depth} = n
            const treeid = Random.string()
            lastOfDepth[depth] = treeid
            treeStore = treeStore.create(treeid)
            treeStore = treeStore.setNode(treeid, {title})
            if (depth > 0) {
                const parentid = lastOfDepth[depth - 1]
                treeStore = treeStore.attachAsChild(treeid, parentid)
            } else {
                rootid = treeid
            }
        })
        return [
            rootid,
            treeStore,
        ]
    }

    static toStore(text) {
        const nodes = text.trim().split('\n')
        const list = nodes.filter((node)=>(!!node)) // remove empty nodes
            .map((node)=>{
                // count tabs
                const tabex = /^(\t+)(.*)/
                const m = node.match(tabex)
                if (m) {
                    return {
                        title: m[2],
                        depth: m[1].length,
                    }
                } else {
                    return {
                        title: node,
                        depth: 0,
                    }
                }
            })
        return Outline._nodeListToTreeStore(list)
    }
}
