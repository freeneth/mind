import { PureComponent } from 'react'
import PropTypes from 'prop-types'
/* eslint-disable no-unused-vars */
import React from 'react'
import ModalDialog from './ModalDialog.jsx'
/* eslint-enable */

export default class ImportTreeDialog extends PureComponent {
    constructor() {
        super()
        this.handleClose = this.handleClose.bind(this)
        this.handleOk = this.handleOk.bind(this)
        this.saveTextArea = this.saveTextArea.bind(this)
    }

    handleClose() {
        this.props.onClose()
    }

    handleOk() {
        const text = this.ta.value
        this.props.onOk(text)
    }

    saveTextArea(ta) {
        this.ta = ta
    }

    render() {
        const {title, display} = this.props
        if (display) {
            return (<ModalDialog
                display={display}
                title={title}
                onOk={this.handleOk}
                onClose={this.handleClose}
                modalStyles={{
                    background: '#f6fff6',
                }}
            >
                <textarea style={{
                    flexGrow: 1,
                    display: 'block',
                    margin: '1em',
                }} ref={this.saveTextArea}/>
            </ModalDialog>)
        } else {
            return null
        }
    }
}

ImportTreeDialog.propTypes = {
    display: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
    onOk: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
}
