/* eslint-disable no-unused-vars */
import React from 'react'
import Tree from './Tree.jsx'
/* eslint-enable */
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

export class ForestContainer extends React.PureComponent {
    constructor(props) {
        super(props)
        this.renderTree = this.renderTree.bind(this)
    }

    renderTree(id) {
        const {selected, treeStore, handlers} = this.props
        const tree = treeStore.getIn(['forest', id])
        const treeStyle = treeStore.getIn(['styles', id])
        const subtreeStyle = tree.childrenid.map(cid =>(treeStore.getIn(['styles', cid])))
        return (<Tree
            key={id}
            tree={tree}
            treeStyle={treeStyle}
            subtreeStyle={subtreeStyle}
            isSelected={selected === id}
            handlers={handlers}
        > </Tree>)
    }

    render() {
        const {rootid, treeStore} = this.props
        return (<React.Fragment>
            {treeStore.descendents(rootid, true).map(this.renderTree)}
        </React.Fragment>)
    }
}

ForestContainer.propTypes = {
    rootid: PropTypes.string.isRequired,
    selected: PropTypes.string.isRequired,
    handlers: PropTypes.object.isRequired,
    treeStore: PropTypes.object.isRequired,
}

const mapStateToProps= (state)=>{
    return {
        treeStore: state.treeStore,
    }
}

export default connect(mapStateToProps)(ForestContainer)
