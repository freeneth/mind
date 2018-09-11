/* eslint-disable no-unused-vars */
import {VLayout} from './Layout.jsx'
import File from './File.jsx'
/* eslint-enable */

import React from 'react'
import PropTypes from 'prop-types'
import Immutable from 'immutable'
import {DropTarget} from 'react-dnd'
import {m} from './style.js'

// react-dnd dropTarget spec
const fileTarget = {
    drop(){
        return {}
    },
}

class FileColumn extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            editing: '',
        }
        this.findFileIndex = this.findFileIndex.bind(this)
        this.moveFile = this.moveFile.bind(this)
        this.setEditing = this.setEditing.bind(this)
    }

    findFileIndex(id) {
        const {files} = this.props
        return files.findIndex((e)=>e.id == id)
    }

    moveFile(id, targetIndex) {
        const index = this.findFileIndex(id)
        this.props.cmds.moveOrder(index, targetIndex)
    }

    setEditing(editing) {
        this.setState({editing})
    }

    render() {
        const styles = FileColumn.styles
        const {
            folderid,
            files,
            selected,
            cmds,
            colorScheme,
            connectDropTarget,
            newFileBtnTitle,
        } = this.props
        console.debug('file:', selected)
        const filesVNode = connectDropTarget(<div
            style = {styles.items}
        >
            {files.filter((f)=>f.folderid === folderid).map((e)=> {
                return <File
                    key={e.id}
                    id={e.id}
                    title={e.title}
                    selected={selected}
                    editing={this.state.editing}
                    cmds={cmds}
                    colorScheme={colorScheme}
                    findFileIndex={this.findFileIndex}
                    moveFile={this.moveFile}
                    setEditing={this.setEditing}
                />
            })}
        </div>)

        const buttonColor = {
            backgroundColor: colorScheme.file.button.back,
            color: colorScheme.file.button.front,
            borderColor: colorScheme.file.button.front,
        }
        const columnColor = {
            backgroundColor: colorScheme.file.back,
        }
        const columnStyles = m(styles, columnColor)
        const createButton = (<div
            onClick={cmds.create}
            style={m(styles.createButton, buttonColor)} >
            {newFileBtnTitle}
        </div>)
        return (<VLayout style={columnStyles}>
            {createButton}
            {filesVNode}
        </VLayout>)
    }
}

export const FilesType = PropTypes.instanceOf(Immutable.List)

FileColumn.propTypes = {
    folderid: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    files: FilesType.isRequired,
    selected: PropTypes.string.isRequired,
    cmds: PropTypes.object.isRequired,
    colorScheme: PropTypes.object.isRequired,
    newFileBtnTitle: PropTypes.string.isRequired,
    // injected by React DnD
    connectDropTarget: PropTypes.func.isRequired,
}

function collect(connect) {
    return {
        connectDropTarget: connect.dropTarget(),
    }
}

FileColumn.styles = {
    borderStyle: 'none',
    width: '50%',
    flex: '1',
    items: {
        flex: '1',
        height: '100%',
        overflowY: 'auto',
    },
    title: {
        width: '80%',
        margin: '1em',
        alignSelf: 'center',
        textAlign: 'center',
        userSelect: 'none',
        cursor: 'default',
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

export default DropTarget('File', fileTarget, collect)(FileColumn)
