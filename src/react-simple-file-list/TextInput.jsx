/* eslint-disable no-unused-vars */
import React from 'react'
/* eslint-enable */

import { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { m } from './style.js'

export default class TextInput extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {value: this.props.text}
        this.onChange = (evt) => this.setState({value: evt.target.value})
    }

    saveRef(ref) {
        this.ref = ref
    }

    getText() {
        return this.ref.value
    }

    componentDidMount() {
        if (this.ref) {
            console.log('setFocus')
            this.ref.focus()
            document.execCommand('selectAll')
        }
    }

    render() {
        const {styles, returnText, onKeyDown}= this.props
        return <input
            ref={this.saveRef.bind(this)}
            type={'text'}
            value={this.state.value}
            onChange={this.onChange}
            onKeyDown={(event)=>onKeyDown(event, this.getText())}
            onBlur={()=>returnText(this.getText())}
            style={m(TextInput.styles, styles)}
        />
    }
}

TextInput.styles = {
    outlineStyle: 'none',
    borderStyle: 'none',
    fontSize: '1em',
    paddingLeft: '0.3em',
    paddingRight: '0.3em',
}

TextInput.defaultProps = {
    text: '',
}

TextInput.propTypes = {
    text: PropTypes.string.isRequired,
    styles: PropTypes.object,
}
