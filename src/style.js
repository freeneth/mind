import styled from 'styled-components'
import Immutable from 'immutable'

export const NonSelect = styled.div`
    user-select: none
`

export const ButtonDiv = styled(NonSelect)`
    cursor: pointer
`

export const colorScheme = {
    L: '#5FA2CC',
    BL: '#196899',
    M: '#90FFEE',
    H: '#FF6D54',
    BH: '#CC5F5F',
}

export const rectRadius = {
    rx: 8,
    ry: 8,
}

export const expandBtnStyleParams = {
    basic: {
        stroke: '#cccccc',
        fill: '#ffffff',
        cursor: 'pointer',
    },
    R: 10,
    rB: 10,
    rS: 5,
}

export const RectStyle = Immutable.Record({
    fill: 'white',
    stroke: 'none',
    strokeWidth: 0,
})

export const TextStyle = Immutable.Record({
    fontSize: 20,
    dominantBaseline: 'central',
})

export const BoxStyle = Immutable.Record({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
})

export const BBox = Immutable.Record({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    rx: 8,
    ry: 8,
})

export const StyleNode = Immutable.Record({
    margin: new BoxStyle(),
    padding: new BoxStyle(),
    text: new TextStyle(),
    rect: new RectStyle(),
    selectedRect: new RectStyle(),

    textDim: new BBox(),
    rectDim: new BBox(rectRadius),
    bbox: new BBox(),
    tree_bbox: new BBox(),
})

export function m(...objs) {
    return Object.assign({}, ...objs)
}

export default class Style {
    static textBBox(text='M', style) {
        const svgns = 'http://www.w3.org/2000/svg'
        if (!Style.hiddenText) {
            let svg = document.createElementNS(svgns, 'svg')
            svg.setAttribute('id', 'svg-hiddenText')
            svg.setAttribute('height', 0)
            svg.setAttribute('width', 0)
            let text = document.createElementNS(svgns, 'text')
            Style.hiddenText = text
            svg.appendChild(text)
            document.body.appendChild(svg)
        }

        if (style) {
            if(style.text.fontSize) {
                Style.hiddenText.setAttribute('font-size', style.text.fontSize)
            }
        }
        Style.hiddenText.textContent = text
        const dombbox = Style.hiddenText.getBBox()
        const bbox = {}
        bbox.width = dombbox.width
        bbox.height = dombbox.height
        bbox.x = dombbox.x
        bbox.y = dombbox.y
        bbox.x += style.padding.left
        bbox.y = style.padding.top
        return new BBox(bbox)
    }

    static rectBBox(content, style) {
        const {width, height} = content
        const {top, bottom, left, right} = style.padding
        const rectWidth = width + left + right
        const rectHeight = height + top + bottom

        return new BBox({
            x: 0, y: 0,
            width: rectWidth, height: rectHeight,
        })
    }

    static groupBBox([...bboxes]) {
        const top = bboxes.reduce((a, e)=>{
            return e.y < a ? e.y : a
        }, Infinity)
        const left = bboxes.reduce((a, e)=>{
            return e.x < a ? e.x : a
        }, Infinity)
        const right = bboxes.reduce((a, e)=> {
            const r = e.x + e.width
            return r > a ? r : a
        }, 0)
        const bottom = bboxes.reduce((a, e)=> {
            const b = e.y + e.height
            return b > a ? b : a
        }, 0)
        return new BBox({
            x: left, y: top,
            width: right - left, height: bottom - top,
        })
    }

    static pointInsideBBox(point, bbox) {
        return bbox.x < point.x && point.x < bbox.x + bbox.width &&
            bbox.y < point.y && point.y < bbox.y + bbox.height
    }

    static TreeAttachIndicator(insert, colorScheme) {
        if (insert) {
            return m(rectRadius, {
                stroke: colorScheme.M,
                fill: colorScheme.M,
            })
        } else {
            return m(rectRadius, {
                stroke: colorScheme.M,
                strokeWidth: 3,
                fill: 'none',
            })
        }
    }

    static ExpandBtn(basic, R, r) {
        function minusPath(r, s) {
            return `M0 ${r} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0ZM${s} ${r} l ${2 * (r - s)} 0`
        }
        function plusPath(r, s) {
            return `M0 ${r} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0ZM${s} ${r} l ${2 * (r-s)} 0M${r} ${s} l 0 ${2 * (r - s)}`
        }
        return {
            radius: r,
            style: m(basic, {
                strokeWidth: r*0.4/2,
            }),
            minusPath: minusPath(r, r*0.4),
            plusPath: plusPath(r, r*0.4),
            dx: R-r,
        }
    }

    static TreeOfLevel(level) {
        if (level === 0) {
            const {base, color} = levelStyleParams('top')
            return levelStyles(base, color)
        } else if (level === 1) {
            const {base, color} = levelStyleParams('middle')
            return levelStyles(base, color)
        } else {
            const {base, color} = levelStyleParams('lower')
            return levelStyles(base, color)
        }

        function levelStyles(base, colors) {
            return StyleNode({
                text: new TextStyle({
                    fontSize: base*3,
                }),
                margin: new BoxStyle({
                    top: base,
                    bottom: base,
                    left: base*2,
                    right: base*2,
                }),
                padding: new BoxStyle({
                    top: base,
                    bottom: base,
                    left: base*2,
                    right: base*2,
                }),
                rect: new RectStyle({
                    fill: colors.rect.fill,
                    stroke: colors.rect.stroke,
                    strokeWidth: base/3,
                }),
                selectedRect: new RectStyle({
                    fill: colors.selected.fill,
                    stroke: colors.selected.stroke,
                    strokeWidth: 3,
                }),
                rectDim: new BBox(rectRadius),
            })
        }

        function levelStyleParams(level) {
            if (level === 'top') {
                return {
                    base: 8,
                    color: {
                        rect: {
                            fill: colorScheme.L,
                            stroke: colorScheme.BL,
                        },
                        selected: {
                            fill: colorScheme.H,
                            stroke: colorScheme.BH,
                        },
                    },
                }
            } else if (level === 'middle') {
                return {
                    base: 6,
                    color: {
                        rect: {
                            fill: colorScheme.L,
                            stroke: colorScheme.BL,
                        },
                        selected: {
                            fill: colorScheme.H,
                            stroke: colorScheme.BH,
                        },
                    },
                }
            } else {
                return {
                    base: 5,
                    color: {
                        rect: {
                            fill: 'rgba(255, 255, 255, 0.01)',
                        },
                        selected: {
                            fill: colorScheme.H,
                        },
                    },
                }
            }
        }
    }
}

