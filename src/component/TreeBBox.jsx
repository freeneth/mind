/* eslint-disable no-unused-vars */
import React from 'react'
/* eslint-enable */
import { PureComponent } from 'react'

export default class TreeBBox extends PureComponent {
    render() {
        const {id, forest} = this.props
        const { tree_bbox} = forest[id].node.style
        const styleT = {
            fill: 'rgba(1, 1, 1, 0.1)',
            stroke: 'red',
        }
        const style = Object.assign({}, styleT, tree_bbox)
        return (<rect 
            style={style} > </rect>)
    }
}
