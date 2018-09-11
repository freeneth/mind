export default class MouseMove {
    constructor() {
        this.mouse = {
            x: 0,
            y: 0,
        }
        this.node = {
            x: 0,
            y: 0,
        }
    }
    save(mouse, node) {
        this._save_node(node)
        this._save_mouse(mouse)
        this.x = mouse.x - node.x
        this.y = mouse.y - node.y
    }

    _save_node(node) {
        const {x, y} = node
        this.node = {x, y}
    }

    _save_mouse(mouse) {
        const {x, y} = mouse
        this.mouse = {x, y}
    }

    load(mouse, scale = 1) {
        const mousemove = {
            x: mouse.x - this.mouse.x,
            y: mouse.y - this.mouse.y,
        }
        return {
            x: this.node.x + 1/scale * mousemove.x,
            y: this.node.y + 1/scale * mousemove.y,
        }
    }
}
