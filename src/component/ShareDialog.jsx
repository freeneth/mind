/* eslint-disable no-unused-vars */
import React from 'react'
import ModalDialog from './ModalDialog.jsx'
/* eslint-enable */
import { m } from '../style.js'

export default class ShareDialog extends React.PureComponent {
    constructor() {
        super()
    }

    componentDidMount() {
        const {mindShareIOCmd, rootid} = this.props
        mindShareIOCmd.get(rootid)
    }

    componentWillReceiveProps(nextProps){
        console.log('componentWillReceiveProps', nextProps)
        if (nextProps.rootid) {
            const list = nextProps.mindShare.shareidList
            if (list && list.length ) {
                if (this.creating) {
                    this.props.mindShareIOCmd.set(this.creating)
                    this.creating = ''
                }
                return
            } else {
                if (!this.creating){
                    if (!nextProps.mindShare.syncing){
                        const shareid = this.props.mindShareCmd.create(nextProps.rootid)
                        this.creating = shareid
                    }
                }
            }
        }
    }

    switchShare(tag,shareid){
        if(tag){
            this.props.mindShareCmd.enable(shareid)
        }else{
            this.props.mindShareCmd.disable(shareid)
        }
        this.props.mindShareIOCmd.set(shareid)
    }

    copyInput() {
        this.input.select()
        document.execCommand('copy')
    }

    render() {
        const { display, title, onClose, mindShare} = this.props
        const url = window.location.host
        let enable = null
        let shareSwtch = null
        if (mindShare.shareidList[0]){
            enable = mindShare.shareOptions[mindShare.shareidList[0]].enable
        }
        if (!mindShare.syncing){
            if (enable){
                shareSwtch = <div style={ShareDialog.styles.offButton} onClick={() => this.switchShare(false, mindShare.shareidList[0])}>关闭链接</div>
            }else{
                shareSwtch = <div style={ShareDialog.styles.onButton} onClick={() => this.switchShare(true, mindShare.shareidList[0])}>开启链接</div>
            }
        }else{
            shareSwtch = <div style={ShareDialog.styles.disableButton}>处理中...</div>
        }
        const shareUrl = mindShare.syncing ? '处理中...' : 'http://'+url+'/#!/share/mind/'+mindShare.shareidList[0]

        let inputdiv = (<div style = { ShareDialog.styles.inputdiv } >
            <input type="text" style={m(ShareDialog.styles.input, ShareDialog.styles.disableStyle)} readOnly="readonly" autoComplete="off" value={shareUrl} />
            <div style={m(ShareDialog.styles.button, ShareDialog.styles.disableStyle)}>复制连接</div>
        </div >)

        if (enable) {
            inputdiv = (<div style={ShareDialog.styles.inputdiv} >
                <input ref={(input)=>this.input=input} type="text" style={ShareDialog.styles.input} readOnly="readonly" autoComplete="off" value={shareUrl} />
                <div style={ShareDialog.styles.button} onClick={this.copyInput.bind(this)}>复制连接</div>
            </div >)
        }
        return (<ModalDialog
            display={display}
            title={title}
            onClose={onClose}
            modalStyles ={{
                backgroundColor: '#FFFFFF',
                top: '36vh',bottom: '36vh',
                left: '32vw',right: '32vw',
            }}
        >
            <div style={ShareDialog.styles.content}>
                {inputdiv}
                <div style={{ marginTop: '1em', alignSelf: 'flex-end'}}>
                    {shareSwtch}
                </div>
            </div>
        </ModalDialog>)
    }

}
ShareDialog.styles={
    content: {
        border: '1px solid #dddddd',
        borderRadius: 4,
        flexGrow: 1,
        boxShadow: '0 0 10px -2px #aeadad inset',
        display: 'flex',
        flexFlow: 'column nowrap',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 'auto 15px',
        padding: '0 3em',
    },
    inputdiv: {
        display: 'flex',
        flexFlow: 'row nowrap',
        alignItems: 'stretch',
        justifyContent: 'center',
        width: '100%',
        height: '2.5em',
        border: '1px solid #ddd',
        borderRadius: 4,
    },
    button: {
        padding: '0.5em',
        cursor: 'pointer',
        color: '#333',
    },
    offButton: {
        padding: '0.1em 0.9em',
        cursor: 'pointer',
        color: 'red', 
        border: '1px solid #696969',
        borderRadius: 4,
        fontSize: 14,
    },
    onButton: {
        padding: '0.1em 0.9em',
        cursor: 'pointer',
        color: 'blue',
        border: '1px solid #696969',
        borderRadius: 4,
        fontSize: 14,
    },
    disableButton: {
        padding: '0.1em 0.9em',
        color: '#000',
        border: '1px solid #696969',
        borderRadius: 4,
        fontSize: 14,
        opacity: 0.5,
        cursor: 'not-allowed',
    },
    disableStyle: {
        color: '#000',
        opacity: 0.5,
        cursor: 'not-allowed',
        userSelect: 'none',
    },
    input: {
        fontSize: 16,
        padding: '0 10px',
        width: 'calc(100% - 7em)',
        flexGrow: 1,
        borderRadius: 4,
        border: 0,
        backgroundColor: '#eee',
        borderRight: '1px solid #ddd',
        boxShadow: 'inset 0 1px 1px rgba(0,0,0,.075)',
        cursor: 'text',
    },
}

