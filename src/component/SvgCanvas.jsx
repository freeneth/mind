import { PureComponent } from 'react'

/* eslint-disable no-unused-vars */
import React from 'react'
import TreeAttachIndicator from './TreeAttachIndicator.jsx'
import TreeBBox from './TreeBBox.jsx'
/* eslint-enable */

import styled from 'styled-components'

/* eslint-disable no-unused-vars */
const Svg = styled.svg`
    width: 100%;
    height: 100%;
    user-select: none;
    cursor: grab
`
/* eslint-enable */

import PropTypes from 'prop-types'

export default class Canvas extends PureComponent {
    render() {
        const {
            children,
            translate,
            scale,
            onMouseDown,
            onMouseUp,
            onWheel,
            onContextMenu,
            onMouseMove,
        } = this.props
        const attr_translate = `translate(${translate.x} ${translate.y})`
        const attr_scale = `scale(${scale})`
        return (
            <Svg
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                version="1.1"
                onMouseDown={onMouseDown}
                onWheel={onWheel}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onContextMenu={onContextMenu}
            >
                <g transform={attr_translate + ',' + attr_scale}>
                    {children}
                </g>
            </Svg>
        )
    }
}

Canvas.propTypes = {
    translate: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
    }),
    scale: PropTypes.number.isRequired,
    onMouseDown: PropTypes.func,
    onWheel: PropTypes.func,
    onContextMenu: PropTypes.func,
    onMouseMove: PropTypes.func,
    style: PropTypes.object,
}
