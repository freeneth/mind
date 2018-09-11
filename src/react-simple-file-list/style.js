export function m(...objs) {
    return Object.assign({}, ...objs)
}

export const colorScheme = {
    folder: {
        back:'#4C4C4C',
        front:'#FFFFFF',
        item: {
            default: '#4C4C4C',
            selected: '#666666',
            frontSelected: '#FFFFFF',
            editing: 'rgba(255,255,255,0.4)',
            overing: 'rgba(0,160,233,0.6)',
        },
        button: {
            back:'#00A0E9',
            front:'#FFFFFF',
        },
    },
    file: {
        back:'#666666',
        front:'#FFFFFF',
        item: {
            default: '#666666',
            selected: '#FFFFFF',
            frontSelected: '#4C4C4C',
            editing: 'rgba(255,255,255,0.7)',
        },
        button: {
            back:'#666666',
            front:'#FFFFFF',
        },
    },
    panel: '#FFFFFF',
}

