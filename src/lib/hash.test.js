import test from 'tape'
import stringify from 'fast-json-stable-stringify'

import { prepareForHash, stakeHash, hashString } from './hash.js'

test('prepareForHash is consistent despite unsorted API responses', t => {
  const res1 = prepareForHash({ test: 'value', equal: true })
  const res2 = prepareForHash({ equal: true, test: 'value' })

  t.plan(1)
  t.equal(res1, res2, 'Objects hash the same with different key ordering')
})

test('prepareForHash optional second parameter ignored if not provided', t => {
  t.plan(1)

  const unsorted = [
    { name: 'Milliways', order: 50 },
    { name: 'Zaphod', order: 100 },
    { name: 'Arthur', order: 1 }
  ]

  const resIfUnsorted = hashString(stringify(unsorted))

  const res = prepareForHash(unsorted)
  t.equal(resIfUnsorted, res, 'Object should not have been sorted by order')
})

test('stake hash results are consistent despite unsorted API nodes', t => {
  const nodesData = [
    {
      data: {
        nodes: [
          { name: 'ZZnode', stakedTotal: '100' },
          { name: 'AAnode', stakedTotal: '100' },
          { name: 'MMnode', stakedTotal: '100' }
        ]
      }
    },
    {
      data: {
        nodes: [
          { name: 'MMnode', stakedTotal: '100' },
          { name: 'AAnode', stakedTotal: '100' },
          { name: 'ZZnode', stakedTotal: '100' }
        ]
      }
    }
  ]

  const res1 = stakeHash(nodesData[0])
  const res2 = stakeHash(nodesData[1])

  t.plan(1)
  t.equal(res1.hash, res2.hash, 'Stake hash is consistent despite different node order')
})

test('stakeHash will not hash an empty array', t => {
  t.plan(4)

  const noStats = null
  const noStatsData = { }
  const noNodes = { data: { } }
  const emptyNodes = { data: { nodes: [] } }

  t.equal(stakeHash(noStats).hash, '-', 'No object resturns blank')
  t.equal(stakeHash(noStatsData).hash, '-', 'Object with no stats returns blank')
  t.equal(stakeHash(noNodes).hash, '-', 'No nodes array returns blank')
  t.equal(stakeHash(emptyNodes).hash, '-', 'Empty nodes array returns blank')
})

test('hashString is sane', t => {
  t.plan(3)
  const test = 'test'

  t.equals(hashString(test), hashString(test), 'The same hash was produce for the same string')
  t.equals(hashString('test'), hashString('test'), 'The same hash was produce for the same string')
  t.notEquals(hashString('test1'), hashString('test2'), 'Different hashes produced for different strings')
})
