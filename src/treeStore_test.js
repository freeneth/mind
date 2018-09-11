import Immutable from 'immutable'
import {TreeStore, Tree} from './treeStore.js'

function test_create() {
    const name = 'create'
    let tm = new TreeStore()
    tm = tm.create('t1')
    console.assert(tm.forest.get('t1').equals(new Tree({id: 't1'})))
    console.log(`passed: ${name}.`)
}

function test_attachAsChild() {
    const name = 'attachAsChild'
    let tm = new TreeStore()
    tm = tm.create('t1')
    tm = tm.create('t2')
    tm = tm.attachAsChild('t2', 't1')
    console.assert(tm.forest.getIn(['t1', 'childrenid', 0]) === 't2')
    console.assert(tm.forest.getIn(['t2', 'parentid']) === 't1')
    console.log(`passed: ${name}.`)
}

function test_attachAsSibling() {
    const name = 'attachAsSibling'
    let tm = new TreeStore()
    tm = tm.create('t1')
    tm = tm.create('t2')
    tm = tm.create('t3')
    tm = tm.create('t4')
    tm = tm.attachAsChild('t2', 't1')
    console.assert(tm.forest.getIn(['t1', 'childrenid', 0]) === 't2')
    console.assert(tm.forest.getIn(['t2', 'parentid']) === 't1')
    tm = tm.attachAsSibling('t3', 't2', true)
    tm = tm.attachAsSibling('t4', 't2', false)
    console.assert(tm.forest.getIn(['t3', 'parentid']) === 't1')
    console.assert(tm.forest.getIn(['t4', 'parentid']) === 't1')
    console.assert(tm.forest.getIn(['t1', 'childrenid']).equals(Immutable.List(['t3', 't2', 't4'])))

    console.log(`passed: ${name}.`)
}

function test_detach() {
    const name = 'detach'
    let tm = new TreeStore()
    tm = tm.create('t1')
    tm = tm.create('t2')
    tm = tm.attachAsChild('t2', 't1')
    console.assert(tm.forest.getIn(['t1', 'childrenid', 0]) === 't2')
    console.assert(tm.forest.getIn(['t2', 'parentid']) === 't1')
    tm = tm.detach('t2')
    console.assert(tm.forest.getIn(['t2', 'parentid']) === '')
    console.assert(tm.forest.getIn(['t1', 'childrenid']).isEmpty())
    console.log(`passed: ${name}.`)
}

function test_remove() {
    const name = 'remove'
    let tm = new TreeStore()
    tm = tm.create('t1')
    tm = tm.create('t2')
    tm = tm.create('t3')
    tm = tm.attachAsChild('t2', 't1')
    console.assert(tm.forest.getIn(['t1', 'childrenid', 0]) === 't2')
    console.assert(tm.forest.getIn(['t2', 'parentid']) === 't1')
    tm = tm.attachAsChild('t3', 't2')
    console.assert(tm.forest.getIn(['t2', 'childrenid', 0]) === 't3')
    console.assert(tm.forest.getIn(['t3', 'parentid']) === 't2')
    tm = tm.remove('t2')
    console.assert(tm.forest.getIn(['t1', 'childrenid']).isEmpty())
    console.assert(tm.forest.size === 1)

    console.log(`passed: ${name}.`)
}

function test_updateStyle() {
    const name = 'updateStyle'
    let tm = new TreeStore()
    tm = tm.create('t1')
    tm = tm.create('t2')
    tm = tm.create('t3')
    tm = tm.create('t4')
    tm = tm.create('t5')
    tm = tm.attachAsChild('t2', 't1')
    tm = tm.attachAsChild('t3', 't1')
    tm = tm.attachAsChild('t4', 't3')
    tm = tm.attachAsChild('t5', 't3')
    tm = tm.updateStyle('t1')
    console.log(name, tm)
}

function test() {
    test_create()
    test_attachAsChild()
    test_attachAsSibling()
    test_detach()
    test_remove()
    test_updateStyle()
}

test()
