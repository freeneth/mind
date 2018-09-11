import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { createLogger } from 'redux-logger'

import { actions, saga, reducer} from './main.js'

const sagaMiddleware = createSagaMiddleware()
const logger = createLogger()
const store = createStore(
    reducer,
    applyMiddleware(sagaMiddleware, logger)
)
sagaMiddleware.run(saga)

function test() {
    store.dispatch(actions.read('1', console.log))
    store.dispatch(actions.read('1', console.log))
    store.dispatch(actions.write('1', console.log))
    store.dispatch(actions.write('1', ()=>{throw 'reason'}))
    store.dispatch(actions.read('1', console.log))

    store.dispatch(actions.write('2', console.log))
    store.dispatch(actions.read('2', console.log))
}

test()
