/* eslint-disable no-unused-vars */
import React from 'react'
import TreeStatus from './TreeStatus.jsx'
import ShareButton from './ShareButton.jsx'
import ShareDialog from './ShareDialog.jsx'
import {HLayout} from './Layout.jsx'
/* eslint-enable */
import styled from 'styled-components'

/* eslint-disable no-unused-vars */
const Root = styled(HLayout)`
    align-items: center;
    justify-content: space-between;
    width: 100%;
    max-height: 50px;
    background: #ffffff;
    border-style: none;
    border-bottom: 1px solid #ededed
`
/* eslint-enable */

export default class Toolbar extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            sharing: false,
        }

        this.toggleSharing = this.toggleSharing.bind(this)
    }

    toggleSharing() {
        this.setState({sharing: !this.state.sharing})
    }

    render() {
        const {syncing, rootid, mindShare, mindShareCmd, mindShareIOCmd} = this.props
        const shareDialog = this.state.sharing ? (<ShareDialog
            title={'分享脑图'}
            display={true}
            onClose={this.toggleSharing}
            rootid={rootid}
            mindShare={mindShare}
            mindShareCmd={mindShareCmd}
            mindShareIOCmd={mindShareIOCmd}
        />) : null

        return (<Root>
            <TreeStatus
                syncing={syncing}
                displayTimeout={1000}
            />
            <ShareButton onClick={this.toggleSharing}>
                <svg width="25" height="25" version="1.1" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                    <g>
                        <path d="m18 4h10v10m-18 8 18-18m-3.8 14v9.3h-20v-20h10" fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.3" />
                    </g>
                </svg>
            </ShareButton>
            {shareDialog}
        </Root>)
    }
}

