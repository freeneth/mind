import 'babel-polyfill'
import { render, unmountComponentAtNode } from 'react-dom'
import { createStore, applyMiddleware} from 'redux'
/* eslint-disable no-unused-vars */
import React from 'react'
import { Provider } from 'react-redux'
import { Reducer, Saga } from './store.js'
import ConnectedMindMap from './ConnectedMindMap.jsx'
import ConnectedShareMind from './ConnectedShareMind.jsx'
/* eslint-enable */
import { createLogger } from 'redux-logger'
import createSagaMiddleware from 'redux-saga'

// callBacks: {
//     saveFile: (id, json)=>Promise()
//     loadFile: (rootid)=>Promise(tree_json)
//
//     setShare: (shareid,rootid,options)=>Promise()
//     getShare: (rootid) =>Promise([{options}])
//
//     saveFileList: (json)=>Promise()
//     loadFileList: ()=>Promise(fileList_json)
//
//     Optional:
//     getAllPlugins: ()=>[PluginInfo]
// }
// PluginInfo: {
//     type: string
//     name: string
//     mount: (mutate: ([PluginNode])=>undefined, space: PluginSpace, dom: DOM)=>undefined   // called when Plugin is going to be mounted
//     unmount: (mutate: ([PluginNode])=>undefined, space: PluginSpace, dom: DOM)=>undefined // called when Plugin is going to be unmounted
//     update: (mutate: ([PluginNode])=>undefined,
//              space: PluginSpace, newSpace: PluginSpace)=>undefined                        // called when selected node change or forest change
// }

export default function initMindMap(element, callbacks) {
    const logger = createLogger({
        duration: true,
    })
    const sagaMiddleware = createSagaMiddleware()

    let middlewares = applyMiddleware(sagaMiddleware, logger)
    /* globals process */
    if (process.env.NODE_ENV === 'production') {
        middlewares = applyMiddleware(sagaMiddleware)
    }
    const store = createStore(Reducer, middlewares)
    sagaMiddleware.run(Saga)

    console.assert(callbacks.saveFile, 'need saveFile')
    console.assert(callbacks.loadFile, 'need loadFile')
    console.assert(callbacks.setShare, 'need setShare')
    console.assert(callbacks.getShare, 'need getShare')
    console.assert(callbacks.saveFileList, 'need saveFileList')
    console.assert(callbacks.loadFileList, 'need loadFileList')

    let {
        saveFile,
        loadFile,
        setShare,
        getShare,
        saveFileList,
        loadFileList,
        getAllPlugins,
    } = callbacks
    /* test without plugin:
    getAllPlugins = undefined
    //*/
    const externalCmd = {
        saveFile,
        loadFile,
        setShare,
        getShare,
        saveFileList,
        loadFileList,
        getAllPlugins,
    }
    render(<Provider store={store}>
        <ConnectedMindMap externalCmd={externalCmd}></ConnectedMindMap>
    </Provider>, element)
}

// callBacks: {
//     getRootid: ()=>Promise(rootid)
//     loadFile: (rootid)=>Promise(tree_json)
// }
export function initShareMind(element, callbacks) {
    const logger = createLogger({
        duration: true,
    })
    const sagaMiddleware = createSagaMiddleware()

    let middlewares = applyMiddleware(sagaMiddleware, logger)
    /* globals process */
    if (process.env.NODE_ENV === 'production') {
        middlewares = applyMiddleware(sagaMiddleware)
    }
    const store = createStore(Reducer, middlewares)
    sagaMiddleware.run(Saga)

    console.assert(callbacks.loadFile, 'need loadFile')
    console.assert(callbacks.getRootid, 'need getRootid')
    const { loadFile, getRootid } = callbacks
    const externalCmd = { loadFile, getRootid }

    render(<Provider store={store}>
        <ConnectedShareMind externalCmd={externalCmd}></ConnectedShareMind>
    </Provider>, element)
}

export function deinit(element) {
    unmountComponentAtNode(element)
}

export {default as defaultContent} from './defaultContent.js'
