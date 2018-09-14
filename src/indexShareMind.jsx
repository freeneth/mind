import { initShareMind } from './main.jsx'

import { mock_loadFile, mock_loadFileList } from './mock.js'
import { FileListState } from './react-simple-file-list/main.jsx'

const callbacks2 = {
    loadFile: mock_loadFile,
    getRootid: () => {
        return mock_loadFileList().then((json)=>{
            const {text} = JSON.parse(json)
            const fl = FileListState.fromJSON(text)
            return fl.selectedFile
        })
    },
}

// initShareMind(document.getElementById('root'), callbacks)
export default callbacks2;
