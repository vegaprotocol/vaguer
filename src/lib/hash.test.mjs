import test from 'tape'
import { prepareForHash, stakeHash, hashString } from './hash.mjs'

test('prepareForHash is consistent despite unsorted API responses', t => {
  const res1 = prepareForHash({ test: 'value', equal: true })
  const res2 = prepareForHash({ equal: true, test: 'value' })

  t.plan(1)
  t.equal(res1, res2, 'Objects hash the same with different key ordering')
})

test('prepareForHash is sane', t => {
  t.plan(1)
  const res = prepareForHash({ key: 'value', field: true })
  const knownHash = '3addfb141cd7c9c4c6543a82191a3707ac29c7a041217782e61d4d91c691aee8'
  t.equal(res, knownHash, 'Hash matches known result')
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
