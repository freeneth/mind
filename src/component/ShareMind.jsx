import { PureComponent } from 'react'
/* eslint-disable no-unused-vars */
import React from 'react'
import { ReadOnlyEditor } from './Editor.jsx'
/* eslint-enable */

export default class MindMap extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            rootid: '',
        }
    }
    componentDidMount() {
        this.props.getRootid().then((rootid)=>{
            console.warn(rootid)
            this.setState({rootid})
        })
    }
    render(){
        const {
            treeStore, syncState,
            TreeStoreCmd } = this.props
        return(<div style={{
            position: 'absolute',
            display: 'flex',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
        }}>
            <ReadOnlyEditor
                treeStore={treeStore}
                syncing={syncState.syncing}
                rootid={this.state.rootid}
                treeStoreCmd={TreeStoreCmd}
            ></ReadOnlyEditor>
        </div>)
    }
}
