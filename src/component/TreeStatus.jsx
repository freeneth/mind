/* eslint-disable no-unused-vars */
import React from 'react'
/* eslint-enable */
import styled from 'styled-components'
import {keyframes} from 'styled-components'
import { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { m } from '../style.js'

export const STATUS_SYNCING = 'STATUS_SYNCING'
export const STATUS_READY = 'STATUS_READY'
export const STATUS_SYNCHED = 'STATUS_SYNCHED'

const loadingbar = keyframes`
    0% {}
    10% {
        margin-top: 5px;
        height: 12px;
        border-color: #d1d8e6;
        background-color: #bac5db;
    }
    20% {
        margin-top: 0px;
        height: 18px;
        border-color: #d1d7e2;
        background-color: #c6ccda;
    }
    30% {
        margin-top: 1px;
        height: 16px;
        border-color: #d1d8e6;
        background-color: #bac5db;
    }
    40% {
        margin-top: 3px;
        height: 14px;
    }
    50% {
        margin-top: 5px;
        height: 12px;
    }
    60% {
        margin-top: 6px;
        height: 8px;
    }
    70% {}
    100% {}
`

/* eslint-disable no-unused-vars */
const Status = styled.div`
    margin-left: 2em;
    text-align: center;
    line-height: 2em;
    font-size: 12px;
    user-select: none;
    cursor: default
`
const Bar = styled.div`
    float: left;
    background-color: #696969;
    border: 1px solid #696969;
    margin-right: 4px;
    margin-top: 6px;
    height: 8px;
    animation-duration: 1s;
    animation-iteration-count: infinite;
    animationName: ${loadingbar};
`
/* eslint-enable */


export default class TreeStatus extends PureComponent {
    constructor() {
        super()
        this.state = {
            status: STATUS_READY,
        }
        this.timer = 0
    }

    componentWillReceiveProps(nextProps) {
        const {syncing, displayTimeout} = this.props
        if (!syncing && nextProps.syncing) {
            clearTimeout(this.timer)
            this.setState({status: STATUS_SYNCING})
        } else if (syncing && !nextProps.syncing) {
            this.setState({status: STATUS_SYNCHED})
            clearTimeout(this.timer)
            this.timer = setTimeout(()=>{
                this.setState({status: STATUS_READY})
            }, displayTimeout)
        }
    }

    render() {
        const {status} = this.state
        const {styles} = TreeStatus
        if (status === STATUS_READY) {
            return <Status style={styles.normal}><span>准备就绪</span></Status>
        }
        if (status === STATUS_SYNCING) {
            const loading = this.renderLoading()
            return <Status style={styles.warning}>
                {loading}
                <span>正在同步，请不要离开页面</span>
            </Status>
        }
        if (status === STATUS_SYNCHED) {
            return <Status style={styles.ok}><span>同步完成</span></Status>
        }
    }

    renderLoading() {
        const {styles} = TreeStatus
        return (<div style={styles.loading}>
            <div style={styles.bar}></div>
            <div style={m(styles.bar, styles.bar1)}></div>
            <div style={m(styles.bar, styles.bar2)}></div>
        </div>)
    }
}

TreeStatus.styles = {
    normal: {
        color: 'rgb(165, 165, 165)',
    },
    warning: {
        color: 'rgb(220, 170, 78)',
    },
    ok: {
        color: 'rgb(64, 179, 99)',
    },
    loading: {
        display: 'inline-block',
        height: 16,
        margin: '0 auto',
    },
    bar: {
        float: 'left',
        backgroundColor: '#696969',
        border: '1px solid #696969',
        marginRight: 4,
        marginTop: 6,
        height: 8,
        animationDuration: '1s',
        animationIterationCount: 'infinite',
        animationName: 'loadingbar',
    },
    bar1: {
        animationDelay: '0.1s',
    },
    bar2: {
        animationDelay: '0.2s',
    },
}

TreeStatus.propTypes = {
    displayTimeout: PropTypes.number.isRequired,
    syncing: PropTypes.bool.isRequired,
}
