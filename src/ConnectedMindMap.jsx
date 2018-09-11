import { connect } from 'react-redux'
import { Action } from './store.js'
import Random from './random.js'
/* eslint-disable no-unused-vars */
import React from 'react'
import MindMap from './component/MindMap.jsx'
/* eslint-enable */

const mapStateToProps= (state)=>{
    return {
        treeStore: state.treeStore,
        mindShare: state.mindShare.toJS(),
        fileList: state.fileList,
        syncState: state.syncState,
    }
}

const mapDispatchToProps = (dispatch, ownProps)=>{
    const {externalCmd: {
        loadFile,
        saveFile,
        setShare,
        getShare,
        loadFileList,
        saveFileList,
        getAllPlugins,
    }} = ownProps
    const MindShareIOCmd = {
        set: (shareid)=>{
            dispatch(Action.mindShare.set(shareid, setShare))
        },
        get: (rootid)=>{
            dispatch(Action.mindShare.get(rootid, getShare))
        },
    }
    const MindShareCmd = {
        enable: (shareid)=>{
            dispatch(Action.mindShare.enable(shareid))
        },
        disable: (shareid)=>{
            dispatch(Action.mindShare.disable(shareid))
        },
        create: (rootid)=>{
            const shareid = Random.string(12)
            dispatch(Action.mindShare.create(rootid, shareid))
            return shareid
        },
        remove: (shareid)=>{
            dispatch(Action.mindShare.remove(shareid))
        },
    }
    const TreeStoreCmd = {
        commit: (store) => {
            dispatch(Action.treeStore.commit(store))
        },
        pull: (id) => {
            dispatch(Action.treeStore.cmd.pull(id, loadFile))
        },
        push: (id) => {
            dispatch(Action.treeStore.cmd.push(id, saveFile))
        },
    }
    const FileListCmd = {
        updateState: (state)=>{
            dispatch(Action.fileList.updateFileListState(state))
        },
    }
    const FileListIOCmd = {
        pull: ()=>{
            dispatch(Action.fileList.cmd.pull(loadFileList))
        },
        push: (json)=>{
            dispatch(Action.fileList.cmd.push(saveFileList, json))
        },
    }
    // Optional call: getAllPlugins()
    const allPlugins = getAllPlugins ? getAllPlugins() : []
    return {
        TreeStoreCmd,
        MindShareIOCmd,
        MindShareCmd,
        FileListCmd,
        FileListIOCmd,
        allPlugins,
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MindMap);
