/* eslint-disable no-unused-vars */
import TextInput from './TextInput.jsx'
import {HLayout} from './Layout.jsx'
import OverflowEllipsis from 'react-overflow-ellipsis'
import {FolderFilled, FolderFilledBar} from './icon.jsx'
/* eslint-enable */

import React from 'react'
import { m } from './style.js'
import PropTypes from 'prop-types'
import { DragSource, DropTarget } from 'react-dnd'

// react-dnd dragSource spec
const folderSource = {
    canDrag(props) {
        // can not drag when editing
        return props.editing !== props.id && !props.virtual
    },
    beginDrag(props) {
        return {
            id: props.id,
            originalIndex: props.findFolderIndex(props.id),
            virtual: props.virtual,
        }
    },
    endDrag(props, monitor) {
        const {id, originalIndex} = monitor.getItem()
        const didDrop = monitor.didDrop()
        if (!didDrop) {
            // if drops outside of valid zone,
            // revert to the originalIndex
            props.moveFolder(id, originalIndex)
        }
    },
    isDragging(props, monitor) {
        return props.id == monitor.getItem().id
    },
}

// react-dnd dropTarget spec
const folderTarget = {
    canDrop(props, monitor) {
        if (monitor.getItemType() === 'File') {
            return true
        } else {
            return false
        }
    },
    drop(props) {
        const {id} = props
        return {
            folderid: id,
        }
    },
    hover(props, monitor) {
        if (monitor.getItemType() === 'File') {
            //a file
        } else {
            const {id: draggedId} = monitor.getItem()
            const {id: overId, virtual} = props
            if (!virtual && draggedId !== overId) {
                const overIndex = props.findFolderIndex(overId)
                props.moveFolder(draggedId, overIndex)
            }
        }
    },
}

/* 文件夹，可以选中 */
class Folder extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            editing: false,
        }
        this.saveRef = (ref) => {
            this.ref = ref
        }
        this.select = (event) => {
            const {id} = this.props
            event.stopPropagation()
            props.cmds.select(id)
        }
        this.remove = (event) => {
            const {id} = this.props
            event.stopPropagation()
            props.cmds.remove(id)
        }
        this.onClick = (event) => {
            const {selected, id, virtual} = this.props
            if (selected === id && !virtual) {
            // virtual folder can't edit name
                console.log('set Editing')
                props.setEditing(id)
            } else {
                this.select(event)
            }
        }

        this.disableEditing = (text) => {
            if (text) {
                const {cmds: {setTitle}, id} = this.props
                setTitle(id, text)
            }
            props.setEditing('')
        }
        this.handleKeyDown = (event, text) => {
            const {ctrlKey, shiftKey, altKey, key} = event
            if (ctrlKey || shiftKey || altKey) {
                return
            } else if (key === 'Escape') {
                event.preventDefault()
                event.stopPropagation()
                this.disableEditing('')
            } else if (key === 'Enter') {
                event.preventDefault()
                event.stopPropagation()
                this.disableEditing(text)
            }
        }
    }

    render() {
        const styles = Folder.styles
        const {
            id,
            title,
            selected,
            virtual,
            editing,
            colorScheme,
            isDragging,
            isOver,
            connectDragSource,
            connectDropTarget,
        } = this.props
        const isSelected = selected === id
        const isEditing = editing === id

        const textColor = {
            color: colorScheme.folder.front,
            backgroundColor: colorScheme.folder.item.default,
        }
        if (isSelected) {
            textColor.backgroundColor = colorScheme.folder.item.selected
            textColor.color = colorScheme.folder.item.frontSelected
        }
        if (isOver) {
            textColor.backgroundColor = colorScheme.folder.item.overing
        }
        if (isEditing) {
            textColor.backgroundColor = colorScheme.folder.item.editing
        }

        const cross = virtual || !isSelected ? (<div
            style={styles.cross}
        >&emsp;</div>) : (<div
            onClick={(event)=>this.remove(event, id)}
            style={styles.cross}
        >✗</div>)

        const icon = virtual ? (<FolderFilledBar style={{
                fill: colorScheme.folder.item.frontSelected,
                height: '2em',
                padding: '0.3em',
            }}/>) : (<FolderFilled style={{
                fill: colorScheme.folder.item.frontSelected,
                height: '2em',
                padding: '0.3em',
            }}/>)

        const textInput = !isEditing ? null :(<TextInput
            ref={this.saveRef.bind(this)}
            styles={m(styles.textInput, textColor)}
            returnText={this.disableEditing}
            onKeyDown={this.handleKeyDown}
            text={title}
        />)
        const textDivStyle = isEditing ? {display: 'none'}: {}
        const textDivDraggingStyle = isDragging ? styles.dragging : {}
        const connect = (e)=> connectDragSource(connectDropTarget(e))
        return connect(<div
            style={m(styles, textColor, textDivDraggingStyle)}
        >
            <HLayout
                style={{
                    width: '100%',
                    margin: 0,
                    padding: 0,
                    borderStyle: 'none',
                }}>
                {icon}
                {textInput}
                <OverflowEllipsis
                    title={title}
                    onClick={this.onClick}
                    style={m(textDivStyle, styles.title)}
                >
                    {title}
                </OverflowEllipsis>
                {cross}
            </HLayout>
        </div>)
    }
}

function dragCollect(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging(),
    }
}

function dropCollect(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
    }
}

Folder.styles = {
    position: 'relative',
    padding: '0.5em 1em',
    cursor: 'pointer',
    userSelect: 'none',
    title: {
        width: '90%',
        padding: '0.3em',
    },
    textInput: {
        width: '100%',
        borderRadius: 5,
        padding: '0.3em',
        fontSize: '1em',
    },
    dragging: {
        opacity: 0,
    },
    cross: {
        padding: '0.3em',
    },
}

Folder.propTypes = {
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    selected: PropTypes.string.isRequired,
    virtual: PropTypes.bool.isRequired,
    editing: PropTypes.string,
    // need by drag and drop
    findFolderIndex: PropTypes.func,
    moveFolder: PropTypes.func,
    // injected by React DnD
    connectDragSource: PropTypes.func,
    isDragging: PropTypes.bool,
    connectDropTarget: PropTypes.func,
    isOver: PropTypes.bool,
}

export default DragSource('Folder', folderSource, dragCollect)(
    DropTarget(['File', 'Folder'], folderTarget, dropCollect)(Folder))
