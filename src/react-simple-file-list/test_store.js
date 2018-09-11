import Immutable from 'immutable'
import {File, Folder, default as FileListState} from './store.js'

function test_create_file() {
    let state = FileListState.createEmpty()
    state = state.createFile('test')
    const target = state.files
    const expect = Immutable.List([new File({
        id: 'test',
        title: 'test',
        folderid: 'default',
    })])
    console.log('test_create_file: create', target.equals(expect))
    console.log('test_create_file: select', state.selectedFile === 'test')
}

function test_create_folder() {
    let state = FileListState.createEmpty()
    state = state.createFolder('test')
    const target = state.folders
    const expect = Immutable.List([new Folder({
        id: 'test',
        title: 'test',
    })])
    console.log('test_create_folder: create', target.equals(expect))
    console.log('test_create_folder: select', state.selectedFolder === 'test')
}

function test_set_file() {
    let state = FileListState.createEmpty()
    state = state.createFile('test')
    let target = state.setFile('test', {title: 'filename'}).files
    const expect = Immutable.List([new File({
        id: 'test',
        title: 'filename',
        folderid: 'default',
    })])
    console.log('test_set_file', target.equals(expect))
}

function test_set_folder() {
    let state = FileListState.createEmpty()
    state = state.createFolder('test')
    let target = state.setFolder('test', {title: 'foldername'}).folders
    const expect = Immutable.List([new Folder({
        id: 'test',
        title: 'foldername',
    })])
    console.log('test_set_folder', target.equals(expect))
}

function test_remove_file() {
    let state = FileListState.createEmpty()
    state = state.createFile('test1')
    state = state.createFile('test2')
    let target = state.files
    console.assert(target.size === 2)
    state = state.removeFile('test2')
    target = state.files
    console.log('test_remove_file: remove', target.size === 1)
    console.log('test_remove_file: select', state.selectedFile === 'test1')
    state = state.removeFile('test1')
    target = state.files
    console.log('test_remove_file: remove', target.size === 0)
    console.log('test_remove_file: select', state.selectedFile === '')
}

function test_remove_folder() {
    let state = FileListState.createEmpty()
    state = state.createFolder('test1')
    state = state.createFolder('test2')
    let target = state.folders
    console.assert(target.size === 2)
    state = state.removeFolder('test1')
    target = state.folders
    console.log('test_remove_folder: remove', target.size === 1)
    console.log('test_remove_folder: select', state.selectedFolder === 'test2')
    state = state.removeFolder('test2')
    target = state.folders
    console.log('test_remove_folder: remove', target.size === 0)
    console.log('test_remove_folder: select', state.selectedFolder === 'default')
}

function test_select_file() {
    let state = FileListState.createEmpty()
    state = state.createFile('test')
    let target = Immutable.fromJS(state.files)
    console.assert(!target.isEmpty())
    target = state.selectFile('test').selectedFile
    const expect = 'test'
    console.log('test_select_file', target === expect)
}

function test_select_folder() {
    let state = FileListState.createEmpty()
    state = state.createFolder('test')
    let target = Immutable.fromJS(state.folders)
    console.assert(!target.isEmpty())
    target = state.selectFolder('test').selectedFolder
    const expect = 'test'
    console.log('test_select_folder', target === expect)
}

const test = () => {
    test_create_file()
    test_create_folder()
    test_set_file()
    test_set_folder()
    test_remove_file()
    test_remove_folder()
    test_select_file()
    test_select_folder()
}

test()
