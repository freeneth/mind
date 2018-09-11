import Immutable from 'immutable'

export default class UndoStore extends Immutable.Record({
    undoStack: Immutable.Stack(),
    redoStack: Immutable.Stack(),
}) {
    constructor() {
        super()
    }

    snapshot(sn) {
        if (!this.undoStack.isEmpty()) {
            const old = this.undoStack.peek()
            if (old.equals(sn)) {
                return
            } else {
                console.log(JSON.stringify(old))
                console.log(JSON.stringify(sn))
            }
        }
        const undoStack = this.undoStack.push(sn)
        return this.set('undoStack', undoStack)
    }
    get canUndo() {
        return !this.undoStack.isEmpty()
    }
    get canRedo() {
        return !this.redoStack.isEmpty()
    }

    peekUndoStack() {
        return this.undoStack.peek()
    }

    peekRedoStack() {
        return this.redoStack.peek()
    }

    undo(sn) {
        return this.set('undoStack', this.undoStack.pop())
            .set('redoStack', this.redoStack.push(sn))
    }
    redo(sn) {
        return this.set('redoStack', this.undoStack.pop())
            .set('undoStack', this.undoStack.push(sn))
    }
    clear() {
        return new UndoStore()
    }
}
