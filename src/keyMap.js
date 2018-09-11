
export class KeyBinding {
    constructor(set) {
        const v = []
        set.forEach((k)=>{
            if (k.match(/^[a-z]$/g)) {
                v.push(k.toUpperCase())
            } else {
                v.push(k)
            }
        })
        this.set = new Set(v)
    }

    has(v) {
        return this.set.has(v)
    }

    get size() {
        return this.set.size
    }

    static get isMac() {
        return /Mac/.test(window.navigator.platform)
    }

    tooltip() {
        let v = []
        if (KeyBinding.isMac) {
            // in order
            if (this.has('Control')) {
                v.push('⌃')
            }
            if (this.has('Alt')) {
                v.push('⌥')
            }
            if (this.has('Shift')) {
                v.push('⇧')
            }
            if (this.has('Meta')) {
                v.push('⌘')
            }
            this.set.forEach((k)=>{
                switch (k) {
                case 'Control':
                case 'Alt':
                case 'Shift':
                case 'Meta':
                    break
                case 'Home':
                    v.push('Home(Fn←)')
                    break
                case 'Enter':
                    v.push('↵')
                    break
                case 'Backspace':
                    v.push('Delete')
                    break
                case 'ArrowLeft':
                    v.push('←')
                    break
                case 'ArrowRight':
                    v.push('→')
                    break
                case 'ArrowUp':
                    v.push('↑')
                    break
                case 'ArrowDown':
                    v.push('↓')
                    break
                default:
                    if (k.match(/^[a-z]$/g)) {
                        v.push(k.toUpperCase())
                    } else {
                        v.push(k)
                    }
                    break
                }
            })
            return v.join('')
        } else {
            // in order
            if (this.has('Control')) {
                v.push('Ctrl')
            }
            if (this.has('Alt')) {
                v.push('Alt')
            }
            if (this.has('Shift')) {
                v.push('Shift')
            }
            if (this.has('Meta')) {
                v.push('Meta')
            }
            this.set.forEach((k)=>{
                switch (k) {
                case 'Control':
                case 'Alt':
                case 'Shift':
                case 'Meta':
                    break
                case 'ArrowLeft':
                    v.push('←')
                    break
                case 'ArrowRight':
                    v.push('→')
                    break
                case 'ArrowUp':
                    v.push('↑')
                    break
                case 'ArrowDown':
                    v.push('↓')
                    break
                default:
                    if (k.match(/^[a-z]$/g)) {
                        v.push(k.toUpperCase())
                    } else {
                        v.push(k)
                    }
                    break
                }
            })
            return v.join('+')
        }
    }
}

// KeyMap -> string
export class KeyMap  {
    constructor(map) {
        this.map = new Map(map)
        this.modifier = {
            ctrl: new WeakSet(),
            alt: new WeakSet(),
            shift: new WeakSet(),
            meta: new WeakSet(),
        }
        this.map.forEach((_, k)=>{
            this._addModifierRef(k)
        })
    }

    _addModifierRef(k) {
        if (k.has('Control') && k.size > 1) {
            this.modifier.ctrl.add(k)
        }
        if (k.has('Alt') && k.size > 1) {
            this.modifier.alt.add(k)
        }
        if (k.has('Shift') && k.size > 1) {
            this.modifier.shift.add(k)
        }
        if (k.has('Meta') && k.size > 1) {
            this.modifier.meta.add(k)
        }
    }

    set(k, v) {
        this._addModifierRef(k)
        return this.map.set(k, v)
    }

    match(event) {
        let keySet = new Set(this.map.keys())
        let chordSize = 0
        function filter(set, b) {
            set.forEach((k)=>{
                if (!b.has(k)) {
                    set.delete(k)
                }
            })
        }
        if (event.ctrlKey) {
            filter(keySet, this.modifier.ctrl)
            chordSize += 1
        }
        if (event.altKey) {
            filter(keySet, this.modifier.alt)
            chordSize += 1
        }
        if (event.shiftKey) {
            filter(keySet, this.modifier.shift)
            chordSize += 1
        }
        if (event.metaKey) {
            filter(keySet, this.modifier.meta)
            chordSize += 1
        }
        if (keySet.size > 0) {
            for(let key of keySet.values()) {
                if (key.size === chordSize + 1) {
                    // modifier + other key
                    switch (event.key) {
                    case 'Control':
                    case 'Alt':
                    case 'Shift':
                    case 'Meta':
                        // ignore modifiers
                        break
                    default: {
                        const v = event.key.match(/^[a-z]$/g) ? event.key.toUpperCase() : event.key
                        if (key.has(v)){
                            return this.map.get(key)
                        }
                    }}
                }
            }
        }
        return null
    }

    static isAlphanumeric(event) {
        return ((!event.ctrlKey && !event.altKey && ! event.metaKey) &&
            (48 <= event.which && event.which <= 57) || //0-9
            (65 <= event.which && event.which <= 90) || //a-z
            !! event.key.match(/^[-_+=[{\]}\\|;:'",<.>/?`~]$/g))
    }

    static isInputMethod(event) {
        return event.which === 229
    }
}
