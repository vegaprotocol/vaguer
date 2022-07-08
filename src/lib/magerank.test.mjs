import test from 'tape'
import { findMostFrequentHash, mage, isMage, summonAMage } from './magerank.mjs'

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

test('summonAMage returns one of the mages in a node list', t => {
  t.plan(1)

  const mage = summonAMage([
    { host: 'Not a mage', '🧙': false },
    { host: 'Tommy', '🧙': '🧙' },
    { host: 'Merlin', '🧙': '🧙' }
  ])

  t.notEqual(mage.host, 'Not a mage', 'Summoned mage should be tommy or merlin')
})

test('summonAMage throws an Error if there are no mages', t => {
  t.plan(1)

  t.throws(() => {
    summonAMage([
      { host: 'Not a mage', '🧙': false },
      { host: 'Henry', '🧙': false },
      { host: 'Dennis' }
    ])
  }, 'Insufficient Mage Error', 'summonAMage should throw')
})

test('isMage returns true for any object with the mage property set to a mage', t => {
  t.plan(1)

  const mageNode = {}
  mageNode[mage] = mage

  t.ok(isMage(mageNode), 'This mage has been deemed not a mage')
})

test('isMage returns false for a non-mage', t => {
  t.plan(4)

  const notAMageNode = {}

  t.notOk(isMage(notAMageNode), 'This non-mage has incorrectly been deemed a mage')
  t.notOk(isMage('totally a mage'), 'This string has incorrectly been deemed a mage')
  t.notOk(isMage({}), 'This empty object has incorrectly been deemed a mage')
  t.notOk(isMage(), 'Undefined has incorrectly been deemed a mage')
})
