import Immutable from 'immutable'
import {createReducers} from './redux_helper.js'
import {channel, delay} from 'redux-saga'
import {actionChannel, take, put, fork, call, cancel, cancelled, join} from 'redux-saga/effects'

const READ_DELAY = 25
const WRITE_DELAY = 500

class SyncState extends Immutable.Record({
    readError: null,
    writeError: null,
    syncing: false,
}){
}

export class Work extends Immutable.Record({
    type: '',
    id: null,
    start: null,
    onOk: null,
    onError: (id, info)=>{console.error(`WorkError: ${info}\nid: ${id}`)},
    onCancel: null,
}){
}

export class ReadWork extends Work {
    constructor(obj) {
        obj.type = 'read'
        super(obj)
    }
}

export class WriteWork extends Work {
    constructor(obj) {
        obj.type = 'write'
        super(obj)
    }
}

const ADD_WORK = 'SYNC_STATE/ADD_WORK'
const WORK_START = 'SYNC_STATE/WORK_START'
const WORK_DONE = 'SYNC_STATE/WORK_DONE'
const WORK_ERROR = 'SYNC_STATE/WORK_ERROR'
export const actions = {
    read: (id, start, onOk, onError, onCancel)=>({
        type: ADD_WORK,
        work: new ReadWork({id, start, onOk, onError, onCancel}),
    }),
    write: (id, start, onOk, onError, onCancel)=>({
        type: ADD_WORK,
        work: new WriteWork({id, start, onOk, onError, onCancel}),
    }),
}
const internal_actions = {
    workStart: (work)=>({
        type: WORK_START,
        work,
    }),
    workDone: (work)=>({
        type: WORK_DONE,
        work,
    }),
    workError: (work, info)=>({
        type: WORK_ERROR,
        work,
        info,
    }),
}

export const reducer = createReducers({
    [WORK_START]: (state)=>{
        return state.set('syncing', true)
    },
    [WORK_DONE]: (state)=>{
        return state.set('syncing', false)
    },
    [WORK_ERROR]: (state, {work})=>{
        const {type} = work
        if (type === 'read') {
            return state.set('readError', work)
        } else {
            return state.set('writeError', work)
        }
    },
}, new SyncState())

function* handleWork(work, delayT=0) {
    const {id, start, onOk, onError, onCancel} = work
    try {
        if (start) {
            yield put(internal_actions.workStart(work))
            yield delay(delayT)
            const value = yield call(start, id)
            if (onOk) {
                yield call(onOk, id, value)
            }
        }
    } catch(err){
        if (onError) {
            yield put(internal_actions.workError(work, err))
            yield call(onError, id, err)
        }
    } finally {
        yield put(internal_actions.workDone(work))
        if (yield cancelled()) {
            if (onCancel) {
                yield call(onCancel, id)
            }
        }
    }
}

function* handle(channel) {
    while (true) {
        const {lastObj, work} = yield take(channel)
        const {type} = work
        const delayT = type === 'read' ? READ_DELAY : WRITE_DELAY
        const {lastType, lastTask} = lastObj
        if (type === lastType) {
            console.info('cancelling for', work)
            yield cancel(lastTask)
        } else {
            if (lastTask) {
                yield join(lastTask)
                console.info('joined for', work)
            }
            lastObj.lastType = type
        }
        lastObj.lastTask = yield fork(handleWork, work, delayT)
    }
}

export function* saga() {
    yield fork(function*() {
        const workChan = yield actionChannel(ADD_WORK)
        const channelMap = {}
        const lastMap = {}
        while(true) {
            const {work} = yield take(workChan)
            const {id} = work
            if (!channelMap[id]) {
                channelMap[id] = yield call(channel)
                yield fork(handle, channelMap[id])
                lastMap[id] = {}
            }
            yield put(channelMap[id], {lastObj: lastMap[id], work})
        }
    })
}

export default {
    actions,
    reducer,
    saga,
    Work,
    ReadWork,
    WriteWork,
}
