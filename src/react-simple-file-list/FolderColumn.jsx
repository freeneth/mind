/* eslint-disable no-unused-vars */
import React from 'react'
import {VLayout} from './Layout.jsx'
import Folder from './Folder.jsx'
/* eslint-enable */

import { PureComponent } from 'react'
import PropTypes from 'prop-types'
import Immutable from 'immutable'
import {DropTarget} from 'react-dnd'
import {m} from './style.js'

// react-dnd dropTarget spec
const folderTarget = {
    drop(){
        return {}
    },
}

class FolderColumn extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            editing: '',
        }
        this.findFolderIndex = this.findFolderIndex.bind(this)
        this.moveFolder = this.moveFolder.bind(this)
        this.setEditing = this.setEditing.bind(this)
    }

    findFolderIndex(id) {
        const {folders} = this.props
        return folders.findIndex((e)=>e.id == id)
    }

    moveFolder(id, targetIndex) {
        const index = this.findFolderIndex(id)
        this.props.cmds.moveOrder(index, targetIndex)
    }

    setEditing(editing) {
        this.setState({editing})
    }

    render() {
        const {
            vFolders,
            folders,
            selected,
            cmds,
            colorScheme,
            connectDropTarget,
            newFolderBtnTitle,
        } = this.props
        console.debug('folder:', selected)
        const styles = FolderColumn.styles
        const vFoldersVNode = vFolders.map((e)=> {
            return <Folder
                key={e.id}
                id={e.id}
                title={e.title}
                selected={selected}
                virtual={true}
                cmds={cmds}
                colorScheme={colorScheme}
            />
        })
        const foldersVNode = connectDropTarget(<div
            style = {styles.items}
        >
            {folders.map((e)=> {
                return <Folder
                    key={e.id}
                    id={e.id}
                    title={e.title}
                    selected={selected}
                    editing={this.state.editing}
                    virtual={false}
                    cmds={cmds}
                    colorScheme={colorScheme}
                    findFolderIndex={this.findFolderIndex}
                    moveFolder={this.moveFolder}
                    setEditing={this.setEditing}
                />
            })}
        </div>)

        const buttonColor = {
            backgroundColor: colorScheme.folder.button.back,
            color: colorScheme.folder.button.front,
            borderColor: colorScheme.folder.button.back,
        }
        const columnColor = {
            backgroundColor: colorScheme.folder.back,
        }
        const columnStyles = m(styles, columnColor)
        const createButton = (<div
            onClick={cmds.create}
            style={m(styles.createButton, buttonColor)}>
            {newFolderBtnTitle}
        </div>)
        return (<VLayout style={columnStyles}>
            {createButton}
            {vFoldersVNode}
            {foldersVNode}
        </VLayout>)
    }
}

FolderColumn.styles = {
    borderStyle: 'none',
    width: '50%',
    flex: '1',
    items: {
        flex: '1',
        height: '100%',
        overflowY: 'auto',
    },
    createButton: {
        margin: '1em 20%',
        marginBottom: '2em',
        padding: '0.4em',
        borderStyle: 'solid',
        borderWidth: '2px',
        borderRadius: '5px',
        textAlign: 'center',
        cursor: 'pointer',
        userSelect: 'none',
    },
}

function collect(connect) {
    return {
        connectDropTarget: connect.dropTarget(),
    }
}

export const FoldersType = PropTypes.instanceOf(Immutable.List)

FolderColumn.propTypes = {
    folders: FoldersType.isRequired,
    selected: PropTypes.string.isRequired,
    cmds: PropTypes.object.isRequired,
    colorScheme: PropTypes.object.isRequired,
    newFolderBtnTitle: PropTypes.string.isRequired,
    // injected by React DnD
    connectDropTarget: PropTypes.func.isRequired,
}

export default DropTarget(['Folder'], folderTarget, collect)(FolderColumn)
