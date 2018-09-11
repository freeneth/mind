/* eslint-disable no-unused-vars */
import React from 'react'
/* eslint-enable */
import Immutable from 'immutable'
import { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { m, rectRadius, colorScheme, default as Style } from '../style.js'

const CHILD = 'CHILD'
const BEFORE = 'BEFORE'
const AFTER = 'AFTER'
const NOOP = ''

export class TreeAttachIndicatorState extends Immutable.Record({
    display: false,
    attach_mode: NOOP,
    targetid: '',
}){
}

export default class TreeAttachIndicator extends PureComponent {
    render() {
        const { display, attach_mode, targetid, treeStore } = this.props

        if (targetid) {
            const bbox = treeStore.getStyle(targetid).bbox.toJS()
            let height = bbox.height / 3
            let y = bbox.y
            let displayStyle = display ? {} : { display: 'none' }
            let style = Style.TreeAttachIndicator(true, colorScheme)
            switch(attach_mode) {
            case CHILD:
                height = bbox.height
                style = Style.TreeAttachIndicator(false, colorScheme)
                break
            case BEFORE:
                y = bbox.y - height
                break
            case AFTER:
                y = bbox.y + bbox.height
                break
            default:
                displayStyle = { display: 'none'}
            }
            style = m(style, displayStyle)

            const dim = m( rectRadius, {
                x: bbox.x,
                width: bbox.width,
                y,
                height,
            })

            return <rect style={style} {...dim}></rect>
        } else {
            return null
        }
    }
}

TreeAttachIndicator.CHILD = CHILD
TreeAttachIndicator.BEFORE = BEFORE
TreeAttachIndicator.AFTER = AFTER
TreeAttachIndicator.NOOP = NOOP

export const AttachModeType = PropTypes.oneOf([
    CHILD,
    BEFORE,
    AFTER,
    NOOP,
])

TreeAttachIndicator.propTypes = {
    treeStore: PropTypes.object.isRequired,
    display: PropTypes.bool.isRequired,
    attach_mode: AttachModeType.isRequired,
    targetid: PropTypes.string,
}
