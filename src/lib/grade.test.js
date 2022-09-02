import test from 'tape'

import { findMostFrequentHash, grade, isGradeA, getGradeANode } from './grade.js'

test('findMostFrequentHash does what it says', t => {
  t.plan(1)

  const nodeList = [
    { host: 'Not this hash', hashHash: '123' },
    { host: 'Not this hash either', hashHash: '456' },
    { host: 'Most frequent', hashHash: '789' },
    { host: 'Most frequent', hashHash: '789' }
  ]

  t.equals(findMostFrequentHash(nodeList), '789', '789 is the most frequent hash')
})

test('findMostFrequentHash ignores -', t => {
  t.plan(1)

  const nodeList = [
    { host: 'Invalid hash', hashHash: '-' },
    { host: 'Invalid hash', hashHash: '-' },
    { host: 'Valid hash', hashHash: '123' }
  ]

  t.equals(findMostFrequentHash(nodeList), '123', '123 is the only valid hash, so its the winner')
})

test('findMostFrequentHash breaks a tie with the first one', t => {
  t.plan(1)

  const nodeList = [
    { host: 'Hash one', hashHash: '123' },
    { host: 'Hash one again', hashHash: '123' },
    { host: 'Another valid hash', hashHash: '456' },
    { host: 'Another valid hash, again', hashHash: '456' }
  ]

  t.equals(findMostFrequentHash(nodeList), '123', '123 gets the mage, as its the first among equals')
})

test('getGradeANode returns one of the mages in a node list', t => {
  t.plan(1)

  const gradeA = getGradeANode([
    { host: 'Not a grade A', grade: false },
    { host: 'Tommy', '🥇': '🥇' },
    { host: 'Merlin', '🥇': '🥇️' }
  ])

  t.notEqual(gradeA.host, 'Not a gradeA', 'Returned grade A node should be tommy or merlin')
})

test('getGradeANode throws an Error if there are no grade A nodes', t => {
  t.plan(1)

  t.throws(() => {
    getGradeANode([
      { host: 'Not an A', grade: false },
      { host: 'Henry', grade: false },
      { host: 'Dennis' }
    ])
  }, 'Insufficient Grade A Nodes Error', 'getGradeANode should throw')
})

test('isGradeA returns true for any object with the grade property set to a grade', t => {
  t.plan(1)

  const node = {}
  node[grade] = grade

  t.ok(isGradeA(node), 'Node incorrectly labelled as node Grade A')
})

test('isGradeA returns false for a non-grade-a-node', t => {
  t.plan(4)

  const notAnANode = {}

  t.notOk(isGradeA(notAnANode), 'This non-graded has incorrectly been deemed a grade a node')
  t.notOk(isGradeA('totally a grade a node'), 'This string has incorrectly been deemed a grade a node')
  t.notOk(isGradeA({}), 'This empty object has incorrectly been deemed a grade a node')
  t.notOk(isGradeA(), 'Undefined has incorrectly been deemed a grade a node')
})
