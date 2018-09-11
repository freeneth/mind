import { PureComponent } from 'react'
import PropTypes from 'prop-types'
/* eslint-disable no-unused-vars */
import React from 'react'
import ContextMenuGroup from './ContextMenuGroup.jsx'
import ReactModal2 from 'react-modal2'
/* eslint-enable */
import { m } from '../style.js'
export default class ContextMenu extends PureComponent {
    constructor() {
        super()
    }

    render() {
        const {
            groups,
            position,
            display,
            hide,
            modalClassName,
            backdropClassName,
            modalStyles,
            backdropStyles,
        } = this.props
        const renderedGroups = groups.map((group)=>(<ContextMenuGroup
            key={JSON.stringify(group.items)}
            styles={ContextMenu.styles.modal.group}
            title={group.title}
            items={group.items}
        />))
        if (display) {
            return (<ReactModal2
                onClose={hide}
                backdropClassName={backdropClassName}
                modalClassName={modalClassName}
                modalStyles={m(ContextMenu.styles.modal, modalStyles, {
                    top: position.y,
                    left: position.x,
                })}
                backdropStyles={m(ContextMenu.styles.backdrop, backdropStyles)}>
                {renderedGroups}
            </ReactModal2>)
        } else {
            return null
        }
    }
}

ContextMenu.styles = {
    modal: {
        userSelect: 'none',
        cursor: 'default',
        position: 'fixed',
        border: 1,
        background: '#f6fff6',
        boxShadow: '1px 1px 7px 2px rgba(0, 0, 0, 0.2)',
        borderRadius: 8,
        outline: 'none',
        minWidth: '12em',
        maxWidth: '18em',
        zIndex: 10000,
        group: {
            padding: 5,
            title: {
                color: '#3a5cc4',
                fontSize: 15,
            },
            subline: {
                background: '#82c4de',
                height: 1,
                marginTop: 3,
                marginBottom: 3,
            },
        },
    },
    backdrop: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
    },
}

ContextMenu.propTypes = {
    groups: PropTypes.object.isRequired,
    position: PropTypes.shape({
        y: PropTypes.number.isRequired,
        x: PropTypes.number.isRequired,
    }).isRequired,
    display: PropTypes.bool.isRequired,
    modalClassName: PropTypes.string,
    backdropClassName: PropTypes.string,
    modalStyles: PropTypes.object,
    backdropStyles: PropTypes.object,
}
