import Immutable from 'immutable'
export class UndoStore extends Immutable.Record({
    undoStack: Immutable.Stack(),
    redoStack: Immutable.Stack(),
}){}

export default class Undo {
    constructor(getSnapshot, setSnapshot) {
        this.getSnapshot = getSnapshot
        this.setSnapshot = setSnapshot
        this.state = new UndoStore()
    }

    snapshot() {
        const snapshot = this.getSnapshot()
        if (!this.state.undoStack.isEmpty()) {
            const old = this.state.undoStack.peek()
            if (old.equals(snapshot)) {
                return
            } else {
                console.log(JSON.stringify(old))
                console.log(JSON.stringify(snapshot))
            }
        }
        const undoStack = this.state.undoStack.push(snapshot)
        this.state = this.state.set('undoStack', undoStack)
    }
    get canUndo() {
        return !this.state.undoStack.isEmpty()
    }
    get canRedo() {
        return !this.state.redoStack.isEmpty()
    }
    undo() {
        if (this.canUndo) {
            const {undoStack, redoStack} = this.state
            const oldSnapshot = undoStack.peek()
            const snapshot = this.getSnapshot()
            this.state = this.state.set('undoStack', undoStack.pop())
                .set('redoStack', redoStack.push(snapshot))
            this.setSnapshot(oldSnapshot)
        }
    }
    redo() {
        if (this.canRedo) {
            const {undoStack, redoStack} = this.state
            const oldSnapshot = redoStack.peek()
            const snapshot = this.getSnapshot()
            this.state = this.state.set('redoStack', redoStack.pop())
                .set('undoStack', undoStack.push(snapshot))
            this.setSnapshot(oldSnapshot)
        }
    }
    clear() {
        this.state = new UndoStore()
    }
}
