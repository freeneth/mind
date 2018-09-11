import React from 'react'
import {render, unmountComponentAtNode} from 'react-dom'
import './Dialog.css'

function isObject (val) {
  return val.toString() === '[object Object]'
}

const keyUpHelper = {
  onEnter (handler) {
    return (e) => {
      if (e.keyCode === 13) {
        handler()
      }
    }
  }
}

/**
 * 弹窗
 * @param Component
 * @param zIndex
 */
export default function showDialog (Component, zIndex = 9) {
  const close = () => {
    unmountComponentAtNode(dom);
    document.body.removeChild(dom);
  }
  const dom = document.createElement("div");
  document.body.appendChild(dom);

  const style = {
    zIndex: zIndex + '',
  };

  class EventMask extends React.Component {
    render () {
      return (<div className={'-dialog -event-mask'} onClick={close} style={style}>
        {isObject(Component) ? Component : <Component onClose={close} />}
      </div>)
    }
  }

  render(
    <EventMask/>,
    dom
  );
}

/**
 * 创建一个默认的确认框
 * @param title 标题
 * @param type {'text' | 'input' | 'render'}
 * @param content 内容，运行\n换行
 * @param placeholder
 * @param component
 * @param canceled 是否需要取消按钮 默认：是
 * @param beforeClose 点击确认按钮后，关闭窗口前调用的方法，
 *                     返回结果可以是一个 promise，代表何时关闭窗口
 *                     promise.reject 同样也会关闭窗口
 * @returns {Promise<any>}
 */
export function showConfirmBox (
  {
    title,
    type = 'text',
    content = '',
    placeholder = '请输入',
    Component,
    canceled = true,
    beforeClose = () => {},
    ensureText = '确定',
    cancelText = '取消'
  }
) {
  return new Promise(((resolve, reject) => {
    showDialog(class ConfirmBox extends React.Component {
      constructor (props) {
        super(props)
        this.state = {
          inputVal: ''
        }
      }

      render () {
        const {onClose} = this.props;
        const handleEnsure = () => {
          resolve(this.state.inputVal)
          Promise.resolve(beforeClose())
            .then(onClose)
        }
        const handleCancel = () => {
          reject('canceled')
          onClose()
        }

        const contents = content.split('\n');

        return <div className={'-confirm-box'} onClick={e => e.stopPropagation()}>
          <div className={'-title'}>{title}</div>
          <div className={'-content'}>
            {type === 'text' && contents.map(it => <div key={it}>{it}</div>)}
            {type === 'input' && <input
              autoFocus={true}
              className={'-input'}
              value={this.state.inputVal}
              placeholder={placeholder}
              onKeyUp={keyUpHelper.onEnter(handleEnsure)}
              onChange={e => this.setState({inputVal: e.target.value})}/>}
            {type === 'render' && (isObject(Component) ? Component : <Component
              onInput={val => this.setState({inputVal: val})}/>)}
          </div>
          <div className={'-op-bar'}>
            <button className={'-ensure-button'} onClick={handleEnsure}>{ensureText}</button>
            {canceled && <button className={'-cancel-button'} onClick={handleCancel}>{cancelText}</button>}
          </div>
        </div>
      }
    })
  }))
}
