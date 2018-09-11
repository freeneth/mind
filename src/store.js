import {combineReducers} from 'redux'
import TreeStore from './treeStore.js'
import MindShare from './mindShare.js'
import FileList from './fileList.js'
import SyncState from './redux-sync-state/main.js'

const Action = {
    mindShare: MindShare.actions,
    treeStore: TreeStore.actions,
    fileList: FileList.actions,
}

const Reducer = combineReducers({
    treeStore: TreeStore.reducer,
    mindShare: MindShare.reducer,
    fileList: FileList.reducer,
    syncState: SyncState.reducer,
})

function* Saga() {
    yield* TreeStore.saga()
    yield* MindShare.saga()
    yield* FileList.saga()
    yield* SyncState.saga()
}

export {
    Action,
    Reducer,
    Saga,
}
