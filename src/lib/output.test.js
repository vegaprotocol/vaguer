import test from 'tape'

import { grade } from './grade.js'
import { outputJson, outputPrometheus, METRIC_NAME } from './output.js'

test('outputPrometheus does what it says: graded', t => {
  t.plan(1)

  const nodeList = [
    { host: 'test-1' }
  ]

  nodeList[0][grade] = grade

  outputPrometheus(nodeList, input => {
    t.equal(input, `${METRIC_NAME}{host="test-1"} 1`, 'Generates a valid prometheus metric of 1')
  })
})

test('outputPrometheus does what it says: ungraded', t => {
  t.plan(1)

  const nodeList = [
    { host: 'test-1' }
  ]

  outputPrometheus(nodeList, input => {
    t.equal(input, `${METRIC_NAME}{host="test-1"} 0`, 'Generates a valid prometheus metric of 0')
  })
})

test('outputJson does what it says: graded', t => {
  t.plan(1)

  const nodeList = [
    { host: 'test-1' }
  ]

  nodeList[0][grade] = grade

  outputJson(nodeList, input => {
    t.doesNotThrow(() => { JSON.parse(input) }, 'Generates valid JSON')
  })
})

test('outputJson does what it says: ungraded', t => {
  t.plan(1)

  const nodeList = [
    { host: 'test-1' }
  ]

  outputJson(nodeList, input => {
    t.doesNotThrow(() => { JSON.parse(input) }, 'Generates valid JSON')
  })
})
