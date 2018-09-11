/* eslint-disable no-unused-vars */
import React from 'react'
import {SimpleFileList} from './main.jsx'
/* eslint-enable */
import {FileListState} from './main.jsx'
import {render} from 'react-dom'

export class SimpleFileListContainer extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            fileList: FileListState.createEmpty(),
        }
        this.updateState = (fileList)=>{
            this.setState({fileList})
        }
    }

    render() {
        return (
            <SimpleFileList
                state={this.state.fileList}
                updateState={this.updateState}
            />
        )
    }
}

render((<div
    style={{
        position: 'absolute',
        width: '30%',
        height: '100%',
    }}
>
    <SimpleFileListContainer/>
</div>), document.getElementById('root'))
