import { Table } from 'console-table-printer'
import { isMage, giveMeARandomMage, mage } from './magerank.mjs'

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

    // Clean up for presentation
    const output = {
      host: node.host,
      blockHeight: node.blockHeight,
      totalPeers: node.totalPeers,
      startupHash: node.startupHash ? node.startupHash.substr(-6) : '-',
      paramHash: node.paramHash ? node.paramHash.substr(-6) : '-',
      steakHash: node.steakHash ? node.steakHash.substr(-6) : '-',
      epochHash: node.epochHash ? node.epochHash.substr(-6) : '-',
      hashHash: node.hashHash ? node.hashHash.substr(-6) : '-'
    }
    output[mage] = node[mage]

    p.addRow(output, { color })
  })

  p.printTable()
  return nodes
}
