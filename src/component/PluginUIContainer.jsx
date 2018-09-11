/* eslint-disable no-unused-vars */
import React from 'react'
import PluginUI from './PluginUI.jsx'
/* eslint-enable */
import PropTypes from 'prop-types'

export default class PluginUIContainer extends React.PureComponent {
    constructor(props) {
        super(props)
    }

    render() {
        const {space, allPlugins, mutate} = this.props
        if (space.rootid && space.forest.size > 0) {
            return (<React.Fragment>
                {allPlugins.map((pi)=> (<PluginUI
                    key={pi.type}
                    space={space}
                    pluginInfo={pi}
                    mutate={mutate}
                />))}
            </React.Fragment>)
        } else {
            return null
        }
    }
}


PluginUIContainer.propTypes = {
    space: PropTypes.object.isRequired,
    allPlugins: PropTypes.array.isRequired,
    mutate: PropTypes.func.isRequired,
}
