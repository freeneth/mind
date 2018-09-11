import { PureComponent } from 'react'
import PropTypes from 'prop-types'
import {defaultContentRaw} from '../defaultContent.js'
/* eslint-disable no-unused-vars */
import React from 'react'
import {ReadWriteEditor} from './Editor.jsx'
import {HLayout, VLayout} from './Layout.jsx'
import Sidebar from './Sidebar.jsx'
import Toolbar from './Toolbar.jsx'
import FileList from './FileList.jsx'
/* eslint-enable */

export default class MindMap extends PureComponent {
    constructor() {
        super()
    }

    componentWillReceiveProps(nextProps) {
        const {
            fileList,
            fileList: { selectedFile },
            FileListCmd,
            treeStore,
            TreeStoreCmd: { push, commit },
        } = this.props;

        //本地数据添加模式
        if (!window.localStorage.getItem('localStart')) { 
            window.localStorage.setItem('localStart','开始')
            console.log("启动本地模式");
            commit(treeStore.remove(selectedFile))
            push(selectedFile)
            // create file
            const dc = defaultContentRaw()
            const {
                fileid,
                file,
            } = dc
            commit(file.updateStyle(fileid))
            //update remote
            push(fileid)
            //update files list
            let fl = nextProps.fileList.createFile(fileid)
            fl = fl.setFile(fileid, dc.fileList.files.get(0))
            FileListCmd.updateState(fl)
    }
        if (selectedFile) {
            if (nextProps.fileList.files.size < fileList.files.size) {
                if (nextProps.fileList.files.isEmpty()) {
                    // last file removed, create default
                    //remove file
                    commit(treeStore.remove(selectedFile))
                    push(selectedFile)
                    // create file
                    const dc = defaultContentRaw()
                    const {
                        fileid,
                        file,
                    } = dc
                    commit(file.updateStyle(fileid))
                    //update remote
                    push(fileid)
                    //update files list
                    let fl = nextProps.fileList.createFile(fileid)
                    fl = fl.setFile(fileid, dc.fileList.files.get(0))
                    FileListCmd.updateState(fl)
                } else {
                    // remove file
                    commit(treeStore.remove(selectedFile))
                    push(selectedFile)
                }
            } else if (nextProps.fileList.files.size > fileList.files.size) {
                // create file
                const newFile = nextProps.fileList.selectedFile
                commit(treeStore.create(newFile, '中心主题')
                    .updateStyle(newFile))
                push(newFile)
            }
        }
    }

    render(){
        const {
            treeStore, mindShare, fileList, syncState,
            allPlugins,
            TreeStoreCmd, MindShareCmd, FileListCmd,
            MindShareIOCmd, FileListIOCmd,
        } = this.props
        return(<div style={{
            position: 'absolute',
            display: 'flex',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
        }}>
            <HLayout style={{ borderStyle: 'none' }}>
                <Sidebar>
                    <FileList
                        state={fileList}
                        fileListCmd={FileListCmd}
                        fileListIOCmd={FileListIOCmd}
                    />
                </Sidebar>
                <VLayout style={{ borderStyle: 'none' }}>
                    <Toolbar
                        syncing={syncState.syncing}
                        rootid={fileList.selectedFile}
                        mindShare={mindShare}
                        mindShareCmd={MindShareCmd}
                        mindShareIOCmd={MindShareIOCmd}
                    />
                    <ReadWriteEditor
                        treeStore={treeStore}
                        rootid = {fileList.selectedFile}
                        treeStoreCmd={TreeStoreCmd}
                        allPlugins={allPlugins}
                    ></ReadWriteEditor>
                </VLayout>
            </HLayout>
        </div>)
    }
}

MindMap.propTypes = {
    treeStore: PropTypes.object.isRequired,
    mindShare: PropTypes.object.isRequired,
    fileList: PropTypes.object.isRequired,
    allPlugins: PropTypes.array.isRequired,

    MindShareCmd: PropTypes.object.isRequired,
    FileListCmd: PropTypes.object.isRequired,

    MindShareIOCmd: PropTypes.object.isRequired,
    FileListIOCmd: PropTypes.object.isRequired,
}
