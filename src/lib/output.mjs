import { Table } from 'console-table-printer'
import { isMage, summonAMage, mage } from './magerank.mjs'

function cleanHostname (url) {
  return url.replace('http://', '').replace('https://', '').replace(':3008', '').replace('.vega.community', '')
}

export async function output (nodes) {
  const p = new Table()
  let mageForComparison
  try {
    mageForComparison = summonAMage(nodes)
  } catch (e) {
    // There is no agreed upon hash, so use an object that should never match
    mageForComparison = { blockHeight: -200 }
  }

  nodes.forEach(node => {
    let color = 'green'

    // Colour code nodes. Green means it is in a set of nodes that agree on ouput
    if (!isMage(node)) {
      if (node.blockHeight !== '-' && node.blockHeight !== mageForComparison.blockHeight) {
        // Yellow means the node was at a different block height to the consensus set,
        // so it failed but for reasons that may be valid due to changes between blocks
        color = 'yellow'
      } else {
        // Red means they're either totally invalid, or disagree on data at the same
        // block height as the consensus set
        color = 'red'
      }
    }

    // Format the first we want to present for the table
    const output = {
      host: cleanHostname(node.host),
      blockHeight: node.blockHeight,
      totalPeers: node.totalPeers,
      // Next two stats disabled for brevity. They still appear in the diagnosis output and are used in hashHash
      // startupHash: node.startupHash ? node.startupHash.substr(-6) : '-',
      // paramHash: node.paramHash ? node.paramHash.substr(-6) : '-',
      steakHash: node.steakHash ? node.steakHash.substr(-6) : '-',
      marketsHash: node.marketsHash ? node.marketsHash.substr(-6) : '-',
      assetsHash: node.assetsHash ? node.assetsHash.substr(-6) : '-',
      governanceHash: node.governanceHash ? node.governanceHash.substr(-6) : '-',
      hashHash: node.hashHash ? node.hashHash.substr(-6) : '-'
    }
    output[mage] = node[mage]

    p.addRow(output, { color })
  })

  p.printTable()
  return nodes
}
