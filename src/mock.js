export function mock_saveFile(id, json){
    return new Promise((res)=>{
        if (id) {
            if (json) {
                console.log('save tree', json)
                window.localStorage.setItem(id, json)
            } else {
                console.log('remove tree', id)
                window.localStorage.removeItem(id)
            }
        }
        setTimeout(res, 500)
    })
}

export function mock_loadFile(rootid) {
    return new Promise((res)=>{
        const treeStore = window.localStorage.getItem(rootid)
        setTimeout(()=>res(treeStore), 500)
    })
}

export function mock_setShare(shareid, rootid, json) {
    return new Promise((res) => {
        if (json) {
            console.log('set share option', json)
            let shareidListJson= window.localStorage.getItem('shareidList'+rootid)
            let shareidList = JSON.parse(shareidListJson)
            if (!shareidList){
                shareidList = []
            }
            const t = shareidList.find(id =>(id === shareid))
            if(!t){
                shareidList.push(shareid)
                window.localStorage.setItem('shareidList'+ rootid, JSON.stringify(shareidList))
            }
            window.localStorage.setItem(shareid, json)
        }
        setTimeout(res, 500)
    })
}

export function mock_getShare(rootid) {
    return new Promise(res=>{
        const shareidList = JSON.parse(window.localStorage.getItem('shareidList' + rootid))
        if (shareidList) {
            setTimeout(()=>{
                const list = shareidList.map((id)=>{
                    return window.localStorage.getItem(id)
                })
                res(list)
            }, 500)
        } else {
            setTimeout(() => res([]), 500)
        }
    })
}

export function mock_saveFileList(json){
    return new Promise((res)=>{
        if (json) {
            console.log('save fileList', json)
            window.localStorage.setItem('fileList', json)
        }
        setTimeout(res, 500)
    })
}

export function mock_loadFileList() {
    return new Promise((res)=>{
        const fileList = window.localStorage.getItem('fileList')
        setTimeout(()=>res(fileList), 500)
    })
}

export function mock_getAllPlugins() {
    return [{
        type: 'showid-plugin',
        name: '显示ID插件',
        mount: mock_mountPlugin,
        update: mock_updatePlugin,
        unmount: mock_unmountPlugin,
    }]
}

// (Mutate, space, dom)=>undefined
function mock_mountPlugin() {
}

// (Mutate, space, dom)=>undefined
function mock_unmountPlugin() {
}

// (Mutate, space, nextSpace)=>undefined
function mock_updatePlugin(mutate, space, nextSpace) {
    console.warn('update', space, nextSpace)
    const old_node_ids = walk((node, reduced)=>{
        return [true, reduced.concat([node])]
    }, space)[1]
    const new_node_ids = walk((node, reduced)=>{
        return [true, reduced.concat([node])]
    }, nextSpace)[1]
    let nodes = old_node_ids.reduce((a, e) => {
        if (!e.storage) {
            // old normal node
            const nnode = nextSpace.getNode(e.id)
            if (nnode && nnode.storage) {
                // binded
                return a.concat([nnode.setTitle(`ShowID(id: ${nnode.id})`)])
            }
        }
        return a
    }, [])
    nodes = new_node_ids.reduce((a, e)=> {
        if (e.storage) {
            // new plugin node
            const onode = space.getNode(e.id)
            if (!onode || !onode.storage) {
                // not exist / not bind in old
                return a.concat([e.setTitle(`ShowID(id: ${e.id})`)])
            }
        }
        return a
    }, nodes)
    mutate(nodes)
}

function walk(f, space, id=space.rootid, reduced=[]) {
    const node = space.getNode(id)
    if (node) {
        const init = f(node, reduced)
        return node.childrenid.reduce((a, e)=> {
            const [cont, reduced] = a
            return cont ? walk(f, space, e, reduced) : a
        } , init)
    } else {
        return [true, []]
    }
}
