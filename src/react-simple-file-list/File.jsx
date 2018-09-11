/* eslint-disable no-unused-vars */
import TextInput from './TextInput.jsx'
import {HLayout} from './Layout.jsx'
import OverflowEllipsis from 'react-overflow-ellipsis'
import {FileEmpty} from './icon.jsx'
/* eslint-enable */

import React from 'react'
import { m } from './style.js'
import PropTypes from 'prop-types'
import { DragSource, DropTarget } from 'react-dnd'
import {showConfirmBox} from "./Dialog.jsx"

// react-dnd dragSource spec
const fileSource = {
    canDrag(props) {
        // can not drag when editing
        return props.editing !== props.id
    },
    beginDrag(props) {
        return {
            id: props.id,
            originalIndex: props.findFileIndex(props.id),
        }
    },
    endDrag(props, monitor) {
        const {id, originalIndex} = monitor.getItem()
        const didDrop = monitor.didDrop()
        if (!didDrop) {
            // if drops outside of valid zone,
            // revert to the originalIndex
            props.moveFile(id, originalIndex)
        } else {
            const {folderid} = monitor.getDropResult()
            if (folderid) {
                props.cmds.moveToFolder(id, folderid)
            }
        }
    },
    isDragging(props, monitor) {
        return props.id == monitor.getItem().id
    },
}

// react-dnd dropTarget spec
const fileTarget = {
    canDrop() {
        return false
    },
    hover(props, monitor) {
        const {id: draggedId} = monitor.getItem()
        const {id: overId} = props
        if (draggedId !== overId) {
            const overIndex = props.findFileIndex(overId)
            props.moveFile(draggedId, overIndex)
        }
    },
}

/* 文件，可以选中
 * if editable，可以选中后编辑名字，删除 */
class File extends React.PureComponent {
    constructor(props) {
        super(props)
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
            showConfirmBox({content: '是否删除该文件，该操作不可恢复'})
                .then(() => {
                    props.cmds.remove(id)
                })
                .catch(() => console.log('用户取消了操作'))
        }
        this.onClick = (event) => {
            const {selected, id} = this.props
            console.log('click')
            if (selected === id) {
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
        const styles = File.styles
        const {
            id,
            title,
            selected,
            editing,
            colorScheme,
            connectDragSource,
            isDragging,
            connectDropTarget,
        } = this.props
        const isSelected = selected === id
        const isEditing = editing === id

        let iconColor = colorScheme.file.front

        const textColor = {
            color: colorScheme.file.front,
            backgroundColor: colorScheme.file.item.default,
        }
        if (isSelected) {
            textColor.backgroundColor = colorScheme.file.item.selected
            textColor.color = colorScheme.file.item.frontSelected
            iconColor = colorScheme.file.item.frontSelected
        }
        if (isEditing) {
            textColor.backgroundColor = colorScheme.file.item.editing
        }

        const cross = !isSelected ? null : (<div
            onClick={(event)=>this.remove(event, id)}
            style={styles.cross}
        >✗</div>)

        const textInput = !isEditing ? null :(<TextInput
            ref={this.saveRef.bind(this)}
            styles={m(styles.textInput, textColor)}
            returnText={this.disableEditing.bind(this)}
            onKeyDown={this.handleKeyDown.bind(this)}
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
                <FileEmpty style={{
                    fill: iconColor,
                    height: '2em',
                    padding: '0.3em',
                }}/>
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

File.styles = {
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

File.propTypes = {
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    selected: PropTypes.string.isRequired,
    editing: PropTypes.string.isRequired,
    setEditing: PropTypes.func.isRequired,
    // need by drag and drop
    findFileIndex: PropTypes.func.isRequired,
    moveFile: PropTypes.func.isRequired,
    // injected by React DnD
    connectDragSource: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired,
}

function dragCollect(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging(),
    }
}

function dropCollect(connect) {
    return {
        connectDropTarget: connect.dropTarget(),
    }
}

export default DragSource('File', fileSource, dragCollect)(
    DropTarget('File', fileTarget, dropCollect)(File))
