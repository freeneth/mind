import Immutable from 'immutable'

export default class PluginSpace extends Immutable.Record({
    rootid: '', // :string.
    selected: '', // :string.
    display: false, // :bool.
    forest: new Immutable.Map(), // :Map<string, Tree>
}) {
    constructor(obj, load)  {
        super(obj)
        console.assert(load)
        this._load = load
    }

    get currentNode() {
        return this.getNode(this.selected)
    }

    // :(string)=>PluginNode
    getNode(id) {
        return this._load(id)
    }
}

export class PluginNode extends Immutable.Record({
    id: '', // :string
    parentid: '', // :string. root node if empty
    childrenid: new Immutable.List(), // :List<string>. no children if empty
    title: null, // :string | null. null: node not bind
    storage: null, // : Map<string, any> | null. null: node not bind
}) {
    constructor(obj)  {
        super(obj)
    }

    get isRoot() {
        return this.parentid === ''
    }

    get isLeaf() {
        return this.childrenid.isEmpty()
    }

    setTitle(title) {
        if (this.storage) {
            return this.set('title', title)
        } else {
            return this
        }
    }

    setStorage(storage) {
        if (this.storage) {
            return this.set('storage', storage)
        } else {
            return this
        }
    }
}

export class Tree extends Immutable.Record({
    id: '', // :string
    parentid: '', // :string. root node if empty
    childrenid: new Immutable.List(), // :List<string>. no children if empty
    hasPlugin: false,
}) {
    get isRoot() {
        return this.parentid === ''
    }

    get isLeaf() {
        return this.childrenid.isEmpty()
    }
}
