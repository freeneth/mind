import { PureComponent } from 'react'
import Immutable from 'immutable'
/* eslint-disable no-unused-vars */
import React from 'react'
/* eslint-enable */
import styled from 'styled-components'

/* eslint-disable no-unused-vars */
const Item = styled.div`
    cursor: pointer;
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    font-size: 12px;
    color: #333333;
    padding: 5px 1em;
    border-radius: 5px,
    transition: all 200ms ease-in-out;
    &:hover {
        background-color: #d1d7e2;
    }
`
/* eslint-enable */

export const MenuItemState = Immutable.Record({
    title: '',
    info: '',
    onClick: null,
})
export const MenuGroupState = Immutable.Record({
    title: '',
    items: Immutable.List(),
})

export default class ContextMenuGroup extends PureComponent {
    constructor() {
        super()
    }

    renderItems() {
        const {items} = this.props
        return items.map((item)=>{
            const {title, info, tooltip, onClick} = item
            return (<Item key={title} title={tooltip}
                onClick={onClick} >
                <span>{title}</span>
                <span>{info}</span>
            </Item>)
        })
    }

    render() {
        const {title, styles} = this.props
        const renderedItems = this.renderItems()
        let renderedTitle
        let renderedSubline
        if (title) {
            renderedTitle = (<div style={styles.title}>{title}</div>)
            renderedSubline = (<div style={styles.subline}></div>)
        }
        return (<div style={styles}>
            {renderedTitle}
            {renderedSubline}
            {renderedItems}
        </div>)
    }
}
