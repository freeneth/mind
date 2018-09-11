import { FileListState } from './react-simple-file-list/main.jsx'
import { createReducers } from './redux_helper.js'
import { takeLatest, put, select } from 'redux-saga/effects'
import SyncState from './redux-sync-state/main.js'

const PULL = 'FILELIST/PULL'
const PUSH = 'FILELIST/PUSH'

const UPDATE_FILE_LIST_STATE = 'FILELIST/UPDATE_FILE_LIST_STATE'
const PULL_OK = 'FILELIST/PULL_OK'
const PULL_ERR = 'FILELIST/PULL_ERR'
const PUSH_OK = 'FILELIST/PUSH_OK'
const PUSH_ERR = 'FILELIST/PUSH_ERR'

export const actions = {
    updateFileListState: (fileListState) => ({
        type: UPDATE_FILE_LIST_STATE,
        fileListState,
    }),
    pull_ok: (json) => ({
        type: PULL_OK,
        json,
    }),
    pull_err: (info) => ({
        type: PULL_ERR,
        info,
    }),
    push_ok: () => ({
        type: PUSH_OK,
    }),
    push_err: (info) => ({
        type: PUSH_ERR,
        info,
    }),
    cmd: {
        pull: (loader) => ({
            type: PULL,
            loader,
        }),
        push: (saver) => ({
            type: PUSH,
            saver,
        }),
    },
}

function update_fileListState(old, { fileListState }) {
    return fileListState
}

function pull_ok(old, { json }) {
    return FileListState.fromJSON(json)
}

function pull_err(old, { info }) {
    console.error(info)
    return old
}

function push_ok(old) {
    return old
}

function push_err(old, { info }) {
    console.error(info)
    return old
}

export const reducer = createReducers({
    [UPDATE_FILE_LIST_STATE]: update_fileListState,
    [PULL_OK]: pull_ok,
    [PULL_ERR]: pull_err,
    [PUSH_OK]: push_ok,
    [PUSH_ERR]: push_err,
}, FileListState.createEmpty())

function* pull({ loader }) {
    const start = function(taskid) {
        console.info('reading', taskid)
        return loader()
    }
    const onOk = function*(taskid, json) {
        console.info('read', taskid)
        if (json) {
            const text = parse(json)
            if (text) {
                yield put(actions.pull_ok(text))
            }
        }
    }
    const onError = function*(taskid, info) {
        console.info('read', taskid)
        yield put(actions.push_err(info))
    }
    yield put(SyncState.actions.read('fileList', start, onOk, onError))
}

function* push({ saver }) {
    const getFileList = state => (state.fileList)
    const fileList = yield select(getFileList)
    const json = toJSON(fileList)

    const start = (taskid) => {
        console.info('writting', taskid)
        return saver(json)
    }
    const onOk = function*(taskid) {
        console.info('written', taskid)
        yield put(actions.push_ok())
    }
    const onError = function*(taskid, info) {
        console.info('write', taskid)
        yield put(actions.push_err(info))
    }
    yield put(SyncState.actions.write('fileList', start, onOk, onError))
}

function* saga() {
    yield takeLatest(PULL, pull)
    yield takeLatest(PUSH, push)
}

export default {
    actions,
    reducer,
    saga,
}

function parse(json) {
    const obj = JSON.parse(json)
    const { version, text } = obj
    console.assert(version === 1)
    return text
}

export function toJSON(fileList) {
    const version = 1
    const text = JSON.stringify(fileList)
    return JSON.stringify({ version, text })
}
