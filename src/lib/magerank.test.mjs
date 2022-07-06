import test from 'tape'
import { findMostFrequentHash } from './magerank.mjs'

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
