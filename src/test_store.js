import { createStore, applyMiddleware } from 'redux'
import { createLogger } from 'redux-logger'
import createSagaMiddleware from 'redux-saga'
import Immutable from 'immutable'
import {
    Action,
    Reducer,
    Saga,
} from './store.js'

function newStore() {
    const logger = createLogger({
        duration: true,
    })
    const sagaMiddleware = createSagaMiddleware()

    const store = createStore(Reducer,
        applyMiddleware(sagaMiddleware, logger)
    )

    sagaMiddleware.run(Saga)

    return store
}

function test_mind_share_create() {
    const store = newStore()
    const rootid = 'rootid1'
    const shareid = 'shareid1'
    store.dispatch(Action.mindShare.create(rootid,shareid))
    const target = store.getState().mindShare.get('rootid')
    const expect = 'rootid1'
    console.log(target === expect);
}

function test_mind_share_remove() {
    const store = newStore()
    store.dispatch(Action.mindShare.create('rootid1', 'shareid1'))
    store.dispatch(Action.mindShare.create('rootid1', 'shareid2'))
    store.dispatch(Action.mindShare.remove('shareid2'))
    const target = store.getState().mindShare.get('shareidList')
    const expect = Immutable.fromJS(['shareid1'])
    console.log(target.equals(expect))
}

function test_mind_share_disable() {
    const store = newStore()
    store.dispatch(Action.mindShare.create('rootid1', 'shareid1'))
    store.dispatch(Action.mindShare.disable('shareid1'))
    const target = store.getState().mindShare.get('shareOptions').get('shareid1').get('enable')
    console.log(target === false)
}

function test_mind_share_enable() {
    const store = newStore()
    store.dispatch(Action.mindShare.create('rootid1', 'shareid1'))
    store.dispatch(Action.mindShare.disable('shareid1'))
    store.dispatch(Action.mindShare.enable('shareid1'))
    const target = store.getState().mindShare.get('shareOptions').get('shareid1').get('enable')
    console.log(target === true)
}

const test = () => {
    test_mind_share_create()
    test_mind_share_remove()
    test_mind_share_disable()
    test_mind_share_enable()
}

test()
