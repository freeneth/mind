/* eslint-disable no-unused-vars */
import React from 'react'
import ExpandBtn from './ExpandBtn.jsx'
/* eslint-enable */
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { PureComponent } from 'react'
import { expandBtnStyleParams } from '../style.js'

/* eslint-disable no-unused-vars */
const NonSelectText = styled.text`
    cursor: default;
    user-select: none
`
/* eslint-enable */

export default class Tree extends PureComponent {
    constructor(props){
        super(props)
        this.state = {
            bigger: false,
        }
        const {handlers, tree } = props
        this.handlers = {
            toggleExpand: (event)=>handlers.toggleExpand(event, tree.get('id')),
            onMouseDown: (event)=>handlers.onMouseDown(event, tree.get('id')),
            onMouseUp: (event)=>handlers.onMouseUp(event, tree.get('id')),
            onDoubleClick: (event)=>handlers.onDoubleClick(event, tree.get('id')),
        }
        this.onMouseEnter = this.onMouseEnter.bind(this)
        this.onMouseLeave = this.onMouseLeave.bind(this)
    }

    renderPath() {
        const {tree, treeStyle: {bbox}, subtreeStyle} = this.props
        if (tree.getIn(['node', 'expand'])) {
            const { x, y, width, height } = bbox
            const endpathlist = subtreeStyle.map(child => {
                const bbox = child.bbox
                return {
                    x: bbox.get('x') - x,
                    y: bbox.get('y') - y + bbox.get('height') / 2 }
            })

            const start = { x: width, y: height / 2 }
            const k1 = 0.99, k2 = 0.01;

            const { R } = expandBtnStyleParams
            const svg_path = endpathlist.map((end, j) => {
                let kx = end.x - k1 * (end.x - start.x);
                let ky = end.y - k2 * (end.y - start.y);
                const d = `M ${start.x} ${start.y} l 0 0 ${R} 0 Q ${kx+R} ${ky} ${end.x} ${end.y}`;
                return <path key={'path' + tree.id + j} d={d} style={{
                    fill: 'none',
                    stroke: 'grey',
                    strokeWidth: 1,
                }}></path>
            })
            return svg_path
        } else {
            return null
        }
    }

    renderRect() {
        const {treeStyle, isSelected} = this.props
        const rectDim = treeStyle.rectDim.toJS()
        let rectStyle
        if (isSelected) {
            rectStyle = treeStyle.selectedRect.toJS()
        } else {
            rectStyle = treeStyle.rect.toJS()
        }
        return (<rect {...rectDim} style={rectStyle} > </rect>)
    }

    renderContent() {
        const {tree: {node: {title}}, treeStyle} = this.props
        const text = treeStyle.text.toJS()
        const textDim = treeStyle.textDim
        const ts = textDim.merge({ y: textDim.y + textDim.height/2 }).toJS() // text y offset
        return (<g>
            <NonSelectText {...ts} style={text}>{title}</NonSelectText>
        </g>)
    }

    onMouseEnter(){
        this.setState({ bigger: true })
    }

    onMouseLeave(){
        this.setState({ bigger: false })
    }

    render() {
        const {tree, treeStyle: {bbox}} = this.props

        const svg_path = this.renderPath()
        const box = this.renderRect()
        const content = this.renderContent()

        const {toggleExpand, onMouseDown, onMouseUp, onDoubleClick} = this.handlers

        const expandBtn = <ExpandBtn expand={tree.getIn(['node', 'expand'])}
            bigger={this.state.bigger}
            bbox={bbox}
            hasChildren={!tree.get('childrenid').isEmpty()}
            toggleExpand={toggleExpand}> </ExpandBtn>

        return (
            <g transform={`translate(${bbox.get('x')} ${bbox.get('y')})`}
                onMouseEnter={this.onMouseEnter}
                onMouseLeave={this.onMouseLeave}>
                {svg_path}
                <g
                    onMouseDown={onMouseDown}
                    onMouseUp={onMouseUp}
                    onDoubleClick={onDoubleClick}>
                    {box}
                    {content}
                </g>
                {expandBtn}
            </g>)
    }
}

Tree.propTypes = {
    tree: PropTypes.object.isRequired,
    treeStyle: PropTypes.object.isRequired,
    subtreeStyle: PropTypes.object.isRequired,
    isSelected: PropTypes.bool.isRequired,
    handlers: PropTypes.shape({
        toggleExpand: PropTypes.func.isRequired,
        onMouseUp: PropTypes.func,
        onMouseDown: PropTypes.func,
        onDoubleClick: PropTypes.func,
    }),
}
