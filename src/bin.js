#!/usr/bin/env node
import { main } from './index.js'

const originalEmit = process.emit

// From https://github.com/nodejs/node/issues/30810
process.emit = function (name, data, ...args) {
  if (
    name === 'warning' &&
    typeof data === 'object' &&
    data.name === 'ExperimentalWarning'
  ) {
    return false
  }

  return originalEmit.apply(process, arguments)
}

main()
