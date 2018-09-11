/* eslint-disable no-unused-vars */
import React from 'react'
/* eslint-enable */
import { expandBtnStyleParams, default as Style } from '../style.js'
import { PureComponent } from 'react'
import PropTypes from 'prop-types'

export default class ExpandBtn extends PureComponent {
    constructor(props) {
        super(props)
        const { R, rB, rS, basic } = expandBtnStyleParams
        this.stylesBig = Style.ExpandBtn(basic, R, rB)
        this.stylesSmall = Style.ExpandBtn(basic, R, rS)
        this.R = R
    }

    path(expand, bigger) {
        let styles = this.stylesSmall
        if(bigger) {
            styles = this.stylesBig
        }
        const {radius, dx, minusPath, plusPath, style} = styles
        const { bbox, toggleExpand } = this.props
        const width = bbox.get('width')
        const height = bbox.get('height')
        const translate = `translate(${width + this.R - radius} ${height / 2 - radius})`
        if (expand) {
            return <path d={minusPath} dx={dx} style={style} transform={translate} onMouseDown={toggleExpand} />
        } else {
            return <path d={plusPath} dx={dx} style={style} transform={translate} onMouseDown={toggleExpand} />
        }
    }

    render() {
        const {hasChildren, expand, bigger} = this.props

        if (hasChildren) {
            return this.path(expand, bigger)
        } else {
            return null
        }
    }
}

ExpandBtn.propTypes = {
    hasChildren: PropTypes.bool.isRequired,
    expand: PropTypes.bool.isRequired,
    bigger: PropTypes.bool.isRequired,
    bbox: PropTypes.object.isRequired,
    toggleExpand: PropTypes.func.isRequired,
}
