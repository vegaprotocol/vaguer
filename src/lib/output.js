import { Table } from 'console-table-printer'

import { getGradeANode, grade, isGradeA } from './grade.js'

export const METRIC_NAME = process.env.npm_package_name || 'vaguer'

function cleanHostname (url) {
  return url.replace('http://', '').replace('https://', '').replace(':3008', '').replace('.vega.community', '')
}

export async function output (nodes) {
  const out = nodes.map(node => {
    // Format the first we want to present for the table
    const output = {
      host: cleanHostname(node.host),
      blockHeight: node.blockHeight,
      totalPeers: node.totalPeers,
      // Next two stats disabled for brevity. They still appear in the diagnosis output and are used in hashHash
      startupHash: node.startupHash ? node.startupHash.substr(-6) : '-',
      paramHash: node.paramHash ? node.paramHash.substr(-6) : '-',
      steakHash: node.steakHash ? node.steakHash.substr(-6) : '-',
      marketsHash: node.marketsHash ? node.marketsHash.substr(-6) : '-',
      assetsHash: node.assetsHash ? node.assetsHash.substr(-6) : '-',
      governanceHash: node.governanceHash ? node.governanceHash.substr(-6) : '-',
      hashHash: node.hashHash ? node.hashHash.substr(-6) : '-',
      https: node.https ? '✓' : '-'
    }
    output[grade] = node[grade]
    return output
  })

  if (process.env.JSON) {
    outputJson(out)
  } else if (process.env.PROMETHEUS) {
    outputPrometheus(out)
  } else {
    outputDefault(out)
  }

  return nodes
}

export function outputDefault (nodes) {
  const p = new Table()
  let nodeForComparison
  try {
    nodeForComparison = getGradeANode(nodes)
  } catch (e) {
    // There is no agreed upon hash, so use an object that should never match
    nodeForComparison = { blockHeight: -200 }
  }

  nodes.forEach(n => {
    let color = 'green'

    // Colour code nodes. Green means it is in a set of nodes that agree on ouput
    if (!isGradeA(n)) {
      if (n.blockHeight !== '-' && Math.abs(n.blockHeight - nodeForComparison.blockHeight) <= 1) {
        // Yellow means the node was at a different block height to the consensus set,
        // so it failed but for reasons that may be valid due to changes between blocks
        color = 'yellow'
      } else {
        // Red means they're either totally invalid, or disagree on data at the same
        // block height as the consensus set
        color = 'red'
      }
    }

    p.addRow(n, { color })
  })

  return p.printTable()
}

export function outputJson (nodes, testMock) {
  const output = testMock || console.log
  return output(JSON.stringify(nodes))
}

export function outputPrometheus (nodes, testMock) {
  const output = testMock || console.log

  nodes.forEach(n => {
    const value = n[grade] === grade ? 1 : 0
    output(`${METRIC_NAME}{ssl="${n.https === '✓'}", host="${n.host}"} ${value}`)
  })
}
