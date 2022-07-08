import { Table } from 'console-table-printer'
import { isMage, giveMeARandomMage } from './magerank.mjs'

export async function output (nodes) {
  const p = new Table()
  const mageForComparison = giveMeARandomMage(nodes)

  nodes.forEach(node => {
    let color = 'green'

    if (!isMage(node)) {
      if (node.blockHeight !== '-' && node.blockHeight !== mageForComparison.blockHeight) {
        color = 'yellow'
      } else {
        color = 'red'
      }
    }

    p.addRow(node, { color })
  })
  p.printTable()
}
