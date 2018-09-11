import { connect } from 'react-redux'
import { Action } from './store.js'
/* eslint-disable no-unused-vars */
import React from 'react'
import ShareMind from './component/ShareMind.jsx'
/* eslint-enable */

const mapStateToProps= (state)=>{
    return {
        treeStore: state.treeStore,
        syncState: state.syncState,
    }
}

const mapDispatchToProps = (dispatch, ownProps)=>{
    const { externalCmd: { loadFile, getRootid }} = ownProps
    const TreeStoreCmd = {
        commit: (store) => {
            dispatch(Action.treeStore.commit(store))
        },
        pull: (id) => {
            dispatch(Action.treeStore.cmd.pull(id, loadFile))
        },
    }
    return {
        TreeStoreCmd,
        getRootid,
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ShareMind);
