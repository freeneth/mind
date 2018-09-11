import Immutable from 'immutable'

export const File = Immutable.Record({
    id: '',
    title: '',
    folderid: 'default',
})

export const Folder = Immutable.Record({
    id: '',
    title: '',
})

export default class FileListState extends Immutable.Record({
    files: Immutable.List(),
    folders: Immutable.List(),
    vFolders: Immutable.List([new Folder({
        id: 'default',
        title: '我的文件',
    })]),
    selectedFile: '',
    selectedFolder: 'default',
}) {
    get allFolders() {
        return this.get('vFolders').concat(this.get('folders'))
    }

    static fromJSON(json) {
        const obj = JSON.parse(json)
        let {
            files,
            folders,
            vFolders,
            selectedFile,
            selectedFolder,
        } = obj
        files = Immutable.List(files.map((f)=>new File(f)))
        folders = Immutable.List(folders.map((f)=>new Folder(f)))
        vFolders = Immutable.List(vFolders.map((f)=>new Folder(f)))
        return new FileListState({
            files,
            folders,
            vFolders,
            selectedFile,
            selectedFolder,
        })
    }

    static createEmpty() {
        return new FileListState()
    }

    hasFile(id) {
        return this.files.some((f)=>f.id===id)
    }

    hasFolder(id) {
        return this.folders.some((f)=>f.id===id)
    }

    // create and select file
    createFile(fileid) {
        const file = new File({
            id: fileid,
            title: fileid,
            folderid: this.get('selectedFolder'),
        })
        const newState = this.withMutations((o)=>{
            o.update('files', (f)=>f.splice(0, 0, file))
            o.set('selectedFile', fileid)
        })
        return new FileListState(newState)
    }

    // create and select folder
    createFolder(folderid) {
        const folder = new Folder({
            id: folderid,
            title: folderid,
        })
        const newState = this.withMutations((o)=>{
            o.update('folders', (f)=>f.splice(0, 0, folder))
            o.set('selectedFolder', folderid)
        })

        return new FileListState(newState)
    }

    setFile(fileid, newFile) {
        const mutator = (l)=>{
            const idx = l.findIndex((e)=>e.get('id') === fileid)
            if (idx >=0) {
                return l.splice(idx, 1, l.get(idx).merge(newFile))
            } else {
                return l
            }
        }
        const newState = this.update('files', mutator)
        return new FileListState(newState)
    }

    moveFileOrder(index, targetIndex) {
        const source = this.getIn(['files', index])
        const newState = this.update('files', (l)=>{
            return l.splice(index, 1).splice(targetIndex, 0, source)
        })
        return new FileListState(newState)
    }

    setFolder(folderid, newFolder) {
        const mutator = (l)=>{
            const idx = l.findIndex((e)=>e.get('id') === folderid)
            if (idx >=0) {
                return l.splice(idx, 1, l.get(idx).merge(newFolder))
            } else {
                return l
            }
        }
        const newState = this.update('folders', mutator)
        return new FileListState(newState)
    }

    moveFolderOrder(index, targetIndex) {
        const source = this.getIn(['folders', index])
        const newState = this.update('folders', (l)=>{
            return l.splice(index, 1).splice(targetIndex, 0, source)
        })
        return new FileListState(newState)
    }

    // remove and select previous/next file in list
    removeFile(fileid) {
        let newid = ''
        const mutator = (l)=>{
            const idx = l.findIndex((e)=>e.get('id') === fileid)
            if (idx > 0) {
                newid = l.getIn([idx - 1, 'id'])
                return l.splice(idx, 1)
            } else if (idx === 0) {
                newid = l.getIn([1, 'id'], '')
                return l.splice(idx, 1)
            } else {
                return l
            }
        }
        let newState = this.update('files', mutator)
        newState = newState.set('selectedFile', newid)
        return new FileListState(newState)
    }

    // remove and select previous/next folder in list
    // put all file under this folder to 'default' folder
    removeFolder(folderid, defaultFolder='default') {
        let newid = defaultFolder
        const folderMutator = (l)=>{
            const idx = l.findIndex((e)=>e.get('id') === folderid)
            if (idx > 0) {
                newid = l.getIn([idx - 1, 'id'])
                return l.splice(idx, 1)
            } else if (idx === 0) {
                newid = l.getIn([1, 'id'], defaultFolder)
                return l.splice(idx, 1)
            } else {
                return l
            }
        }
        const fileMutator = (l)=>{
            return l.map((e)=>{
                if(e.get('folderid') === folderid) {
                    return e.set('folderid', defaultFolder)
                } else {
                    return e
                }
            })
        }
        let newState = this.update('folders', folderMutator)
        newState = newState.set('selectedFolder', newid)
        newState = newState.update('files', fileMutator)
        return new FileListState(newState)
    }

    selectFile(fileid) {
        const newState = this.set('selectedFile', fileid)
        return new FileListState(newState)
    }

    selectFolder(folderid) {
        const newState = this.set('selectedFolder', folderid)
        return new FileListState(newState)
    }

}

