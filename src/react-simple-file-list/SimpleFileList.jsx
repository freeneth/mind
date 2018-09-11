/* eslint-disable no-unused-vars */
import React from 'react'
import {HLayout} from './Layout.jsx'
import FolderColumn from './FolderColumn.jsx'
import FileColumn from './FileColumn.jsx'
/* eslint-enable */

import { PureComponent } from 'react'
import PropTypes from 'prop-types'
import {FilesType} from './FileColumn.jsx'
import {FoldersType} from './FolderColumn.jsx'
import {m, colorScheme} from './style.js'
import Random from './random.js'
import {DragDropContext} from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

class SimpleFileList extends PureComponent {
    constructor(props) {
        super(props)
        this.fileCmds = {
            create: ()=>{
                let {state, updateState, defaultFileTitle} = this.props
                const id = Random.string()
                state = state.createFile(id)
                state = state.setFile(id, {title: defaultFileTitle})
                updateState(state)
            },
            select: (id)=>{
                let {state, updateState} = this.props
                state = state.selectFile(id)
                updateState(state)
            },
            remove: (id)=>{
                let {state, updateState} = this.props
                state = state.removeFile(id)
                updateState(state)
            },
            moveOrder: (index, targetIndex)=>{
                let {state, updateState} = this.props
                state = state.moveFileOrder(index, targetIndex)
                updateState(state)
            },
            moveToFolder: (id, folderid)=>{
                let {state, updateState} = this.props
                state = state.setFile(id, {folderid})
                updateState(state)
            },
            setTitle: (id, title)=>{
                let {state, updateState} = this.props
                state = state.setFile(id, {title})
                updateState(state)
            },
        }
        this.folderCmds = {
            create: ()=>{
                let {state, updateState, defaultFolderTitle} = this.props
                const id = Random.string()
                state = state.createFolder(id)
                state = state.setFolder(id, {title: defaultFolderTitle})
                updateState(state)
            },
            select: (id)=>{
                let {state, updateState} = this.props
                state = state.selectFolder(id)
                updateState(state)
            },
            remove: (id)=>{
                let {state, updateState} = this.props
                state = state.removeFolder(id)
                updateState(state)
            },
            moveOrder: (index, targetIndex)=>{
                let {state, updateState} = this.props
                state = state.moveFolderOrder(index, targetIndex)
                updateState(state)
            },
            setTitle: (id, title)=>{
                let {state, updateState} = this.props
                state = state.setFolder(id, {title})
                updateState(state)
            },
        }
    }

    render() {
        const {
            state,
            styles,
            defaultNewFolderBtnTitle,
            defaultNewFileBtnTitle,
        } = this.props
        const {
            files,
            vFolders,
            folders,
            allFolders,
            selectedFile,
            selectedFolder,
        } = state
        const selectedFolderTitle = allFolders.find((e)=>e.id === selectedFolder).title

        return (<HLayout style={m(SimpleFileList.styles.hlayout, styles)}>
            <FolderColumn
                vFolders={vFolders}
                folders={folders}
                selected={selectedFolder}
                cmds={this.folderCmds}
                colorScheme={colorScheme}
                newFolderBtnTitle={defaultNewFolderBtnTitle}
            />
            <FileColumn
                folderid={selectedFolder}
                title={selectedFolderTitle}
                files={files}
                selected={selectedFile}
                cmds={this.fileCmds}
                colorScheme={colorScheme}
                newFileBtnTitle={defaultNewFileBtnTitle}
            />
        </HLayout>)
    }
}

SimpleFileList.defaultProps = {
    defaultFileTitle: '新文件',
    defaultFolderTitle: '新分类',
    defaultNewFileBtnTitle: '新建文件',
    defaultNewFolderBtnTitle: '新建分类',
}

SimpleFileList.styles = {
    hlayout: {
        backgroundColor: colorScheme.panel,
        color: colorScheme.front,
        height: '100%',
        minWidth: '26em',
        justifyContent: 'space-around',
    },
}

const FileListType = PropTypes.shape({
    files: FilesType.isRequired,
    folders: FoldersType.isRequired,
    selectedFile: PropTypes.string.isRequired,
    selectedFolder: PropTypes.string.isRequired,
})

SimpleFileList.propTypes = {
    state: FileListType.isRequired,
    updateState: PropTypes.func.isRequired,
    defaultFileTitle: PropTypes.string.isRequired,
    defaultFolderTitle: PropTypes.string.isRequired,
    styles: PropTypes.object,
}

export default DragDropContext(HTML5Backend)(SimpleFileList)
