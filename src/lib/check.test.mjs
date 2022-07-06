import test from 'tape'
import { chef, stakeChef } from './check.mjs'

test('chef hash is consistent despite unsorted API responses', t => {
  const res1 = chef({ test: 'value', equal: true })
  const res2 = chef({ equal: true, test: 'value' })

  t.plan(1)
  t.equal(res1, res2, 'Objects hash the same with different key ordering')
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

  const res1 = stakeChef(nodesData[0])
  const res2 = stakeChef(nodesData[1])

  t.plan(1)
  t.equal(res1, res2, 'Stake hash is consistent despite different node order')
})

test('stake chef will not hash an empty array', t => {
  t.plan(4)

  const noStats = null
  const noStatsData = { }
  const noNodes = { data: { } }
  const emptyNodes = { data: { nodes: [] } }

  t.equal(stakeChef(noStats), '-', 'No object resturns blank')
  t.equal(stakeChef(noStatsData), '-', 'Object with no stats returns blank')
  t.equal(stakeChef(noNodes), '-', 'No nodes array returns blank')
  t.equal(stakeChef(emptyNodes), '-', 'Empty nodes array returns blank')
})
