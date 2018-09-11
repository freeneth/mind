/* eslint-disable no-unused-vars */
import React from 'react'
/* eslint-enable */
import Immutable from 'immutable'
import PropTypes from 'prop-types'

export default class PluginUI extends React.PureComponent {
    constructor(props) {
        super(props)
        this.saveref = this.saveref.bind(this)
    }

    componentDidMount() {
        const {pluginInfo: {mount}, mutate, space} = this.props
        mount(mutate, space, this.ref)
    }

    componentWillUpdate(nextProps) {
        const {pluginInfo: {update}, mutate, space} = this.props
        console.warn(space, nextProps.space)
        if (!space.equals(nextProps.space)) {
            update(mutate, space, nextProps.space)
        }
    }

    componentWillUnmount() {
        const {pluginInfo: {unmount}, mutate, space} = this.props
        unmount(mutate, space, this.ref)
    }

    saveref(ref) {
        this.ref = ref
    }

    render() {
        const {space} = this.props
        const {styles: {normal, full}} = PluginUI
        const style = space.display ? full : normal
        return (<div ref={this.saveref} style={style}/>)
    }
}

PluginUI.styles = {
    normal: {
        width: 360,
        position: 'absolute',
        right: 0,
        borderStyle: 'solid',
    },
    full: {
        position: 'absolute',
        backgroundColor: 'rgba(0, 0, 0, 0.0)',
        width: '100%',
        height: '100%',
    },
}

export class PluginUIState extends Immutable.Record({
    display: false,
}) {
    setDisplay(v) {
        return this.set('display', v)
    }
}

PluginUI.propTypes = {
    space: PropTypes.object.isRequired,
    pluginInfo: PropTypes.shape({
        type: PropTypes.string.isRequired,
        mount: PropTypes.func.isRequired,
        unmount: PropTypes.func.isRequired,
        update: PropTypes.func.isRequired,
    }).isRequired,
    mutate: PropTypes.func.isRequired,
}
