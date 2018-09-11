/* eslint-disable no-unused-vars */
import React from 'react'
import ReactModal2 from 'react-modal2'
/* eslint-enable */
import styled from 'styled-components'
import { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { m } from '../style.js'

/* eslint-disable no-unused-vars */
const InputDiv = styled.div`
    box-sizing: border-box;
    position: absolute;
    background: #fff;
    min-width: 1em;
    max-width: 20em;
    left: 0;
    top: 0;
    padding: 3px 5px;
    margin-top: -5px;
    margin-left: -3px;
    box-shadow: 0 0 20px rgba(0, 0, 0, .5);
    font-size: 14px;
    line-height: 1.4em;
    min-height: 1.4em;
    overflow: hidden;
    word-break: break-all;
    word-wrap: break-word;
    border: none;
    opacity: 0;
    z-index: -1000;
`
/* eslint-enable */

export default class InputText extends PureComponent {
    constructor() {
        super()
        this.close = this.close.bind(this)
    }

    componentDidUpdate() {
        if (this.props.target) {
            console.log('Focusing')
            if (!this.active) {
                this.focus()
                document.execCommand('selectAll')
            }
        }
    }

    calculateStyle(canvas, targetStyle) {
        const {translate: {x, y}, scale} = canvas
        const fontSize = scale * targetStyle.text.fontSize
        const fontOffset = 0.35
        const {bbox, padding} = targetStyle
        const top = y + scale * (bbox.y + padding.top + fontSize*fontOffset/2)
        const left = x + scale * (bbox.x + padding.left - fontSize*fontOffset/2)
        return {top, left, fontSize}
    }

    focus() {
        if (this.inputText) {
            this.inputText.focus()
        }
    }

    close() {
        const {close} = this.props
        close(this.innerText)
    }

    get innerText() {
        return this.inputText.innerText
    }

    render() {
        const {target, targetStyle, canvas, active, onBlur} = this.props
        const styles = InputText.styles
        if (target) {
            const activeStyle = active ? styles.inputActive : {}
            let style = this.calculateStyle(canvas, targetStyle)
            style = m(style, activeStyle)
            return active ? (<ReactModal2
                onClose={this.close}
                closeOnEsc={false}
                backdropStyles={styles.backdrop}
            >
                <InputDiv
                    dangerouslySetInnerHTML={{__html: this.props.text}}
                    innerRef={(input) => { this.inputText = input }}
                    contentEditable
                    onBlur={this.close}
                    strp-br="true"
                    tabIndex="-1"
                    style={style}>
                </InputDiv>
            </ReactModal2>) : (<InputDiv
                dangerouslySetInnerHTML={{__html: this.props.text}}
                innerRef={(input) => { this.inputText = input }}
                contentEditable
                onBlur={onBlur}
                strp-br="true"
                tabIndex="-1"
                style={style}>
            </InputDiv>)
        } else {
            return null
        }
    }
}

InputText.styles = {
    backdrop: {
        position: 'absolute',
        backgroundColor: 'rgba(0, 0, 0, 0)',
        width: '100%',
        height: '100%',
    },
    inputActive: {
        opacity: 1,
        zIndex: 999,
    },
}

InputText.propTypes = {
    text: PropTypes.string.isRequired,
    active: PropTypes.bool.isRequired,
    close: PropTypes.func.isRequired,
    canvas: PropTypes.shape({
        translate: PropTypes.shape({
            x: PropTypes.number.isRequired,
            y: PropTypes.number.isRequired,
        }).isRequired,
        scale: PropTypes.number.isRequired,
    }),
    target: PropTypes.object,
}
