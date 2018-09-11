/* eslint-disable no-unused-vars */
import React from 'react'
import {SimpleFileList} from '../react-simple-file-list/main.jsx'
/* eslint-enable */
import {FileListState} from '../react-simple-file-list/main.jsx'
import PropTypes from 'prop-types'

export default class FileList extends React.Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        const {fileListIOCmd: {pull}} = this.props
        pull()
    }

    componentWillReceiveProps(nextProps) {
        if (!nextProps.state.equals(this.props.state)) {
            const {fileListIOCmd: {push}} = this.props
            push()
        }
    }

    render() {
        const {state, fileListCmd} = this.props
        return (
            <SimpleFileList
                styles={{borderStyle: 'none'}}
                state={state}
                updateState={fileListCmd.updateState}
            />
        )
    }
}

FileList.propTypes = {
    state: PropTypes.instanceOf(FileListState).isRequired,
    fileListCmd: PropTypes.shape({
        updateState: PropTypes.func.isRequired,
    }).isRequired,
    fileListIOCmd: PropTypes.shape({
        pull: PropTypes.func.isRequired,
        push: PropTypes.func.isRequired,
    }).isRequired,
}
