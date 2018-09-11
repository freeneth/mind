import Outline from './outline.js'
import { FileListState } from './react-simple-file-list/main.jsx'
import { toJSON as fl_toJSON } from './fileList.js'
import { toJSON as ts_toJSON } from './treeStore.js'

const defaultFileOutline = `
欢迎使用脑图
	简介
		免安装：无需安装，在线打开即可使用脑图功能
		云储存：操作结果自动保存到云端，即时保存，随时查看
		易分享：一键分享在线脑图，一人编辑多人查看
	功能
		基本操作
			选择节点
				鼠标左键
			展开/收起子节点
				鼠标左键节点连接处+/-符号
			编辑内容
				鼠标双击左键
			移动整个图
				鼠标左键拖动背景或根节点
			改变脑图结构
				鼠标左键拖动普通节点
			新建当前位置的子节点
				键盘Tab键
			新建当前位置的下一个节点
				键盘Enter键
			删除当前位置的节点及其子节点
				键盘Delete键
			使用更多功能
				鼠标右键菜单
		分享
			一键生成分享链接
			关闭已有的分享
		高级操作
			重新定位到根节点
			键盘方向键快速切换当前节点
			剪切、复制、粘贴
			撤销、重做
			导入大纲格式的其他脑图
			绑定插件
`
export function defaultContentRaw() {
    const [fileid, file] = Outline.toStore(defaultFileOutline)
    let fileList = new FileListState()
    fileList = fileList.createFile(fileid)
    fileList = fileList.setFile(fileid, {title: file.getNode(fileid).title})
    return {
        fileList,
        fileid,
        file,
    }
}

export default function defaultContent() {
    const raw = defaultContentRaw()
    return {
        fileList: fl_toJSON(raw.fileList),
        fileid: raw.fileid,
        file: ts_toJSON(raw.file, raw.fileid),
    }
}
