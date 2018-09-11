import init from './main.jsx'

import {
    mock_saveFile,
    mock_loadFile,
    mock_setShare,
    mock_getShare,
    mock_saveFileList,
    mock_loadFileList,
    mock_getAllPlugins,
} from './mock.js'

const callbacks = {
    saveFile: mock_saveFile,
    loadFile: mock_loadFile,
    setShare: mock_setShare,
    getShare: mock_getShare,
    saveFileList: mock_saveFileList,
    loadFileList: mock_loadFileList,
    getAllPlugins: mock_getAllPlugins,
}

init(document.getElementById('root'), callbacks)
