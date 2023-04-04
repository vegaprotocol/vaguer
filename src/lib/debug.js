import { diffJson } from 'diff'
import chalk from 'chalk'

import { isGradeA, getGradeANode } from './grade.js'

/**
 * Produces coloured diff output for JSON where the hash differs. This shouldn't
 * happen very often, so it's worth displaying the diff to help data node operators
 * work out what the problem is
 *
 * @param hashname String title to display in the output
 * @param badProperty Object the data that went in to the hash on the node deemed incorrect
 * @param goodProperty Object the corresponding data from a good node
 **/
export function hashMismatchOutput (hashName, badProperty, goodProperty) {
  if (badProperty === '-' || badProperty === undefined) {
    console.debug(`${hashName} hash was empty`)
    return
  }
  console.group(`${hashName} hash was different:`)
  const badDiff = diffJson(goodProperty, badProperty, { context: 2, ignoreWhitespace: false })
  badDiff.forEach((part) => {
    const color = part.added
      ? chalk.green(part.value)
      : part.removed ? chalk.red(part.value) : chalk.grey(part.value)
    if (color) {
      console.log(color)
    }
  })

  console.groupEnd()
}

/**
 * Boring function to decide which fields we need want to display to help
 * diagnose a hash mismatch between nodes.
 *
 * Could be less repetitive.
 *
 * @param badNode an object containing the responses from a non-grade-a node
 * @param goodNode an object containing the responses from a known good node
 */
export function findIncorrectHash (badNode, goodNode) {
  console.dir(badNode)
  if (badNode.startupHash !== goodNode.startupHash) {
    hashMismatchOutput('Startup', badNode.data.startup, goodNode.data.startup)
  }

  if (badNode.paramHash !== goodNode.paramHash) {
    hashMismatchOutput('Params', badNode.data.params, goodNode.data.params)
  }

  if (badNode.steakHash !== goodNode.steakHash) {
    hashMismatchOutput('Stake', badNode.data.steak, goodNode.data.steak)
  }

  if (badNode.epochHash !== goodNode.epochHash) {
    hashMismatchOutput('Epoch', badNode.data.epoch, goodNode.data.epoch)
  }

  if (badNode.assetsHash !== goodNode.assetsHash) {
    hashMismatchOutput('Assets', badNode.data.assets, goodNode.data.assets)
  }

  if (badNode.marketsHash !== goodNode.marketsHash) {
    hashMismatchOutput('Markets', badNode.data.markets, goodNode.data.markets)
  }

  if (badNode.governanceHash !== goodNode.governanceHash) {
    hashMismatchOutput('Governance', badNode.data.governance, goodNode.data.governance)
  }
}

/**
 * If a node is reported not to be grad A, debug tries to figure out what is not right
 * about it so that anyone running vaguer can try and fix it.
*/
export function debug (nodes) {
  let gradeANode

  if (process.env.JSON || process.env.PROMETHEUS) {
    // Just skip it
    return nodes
  }

  try {
    gradeANode = getGradeANode(nodes)
  } catch (e) {
    console.error('Not enough good nodes to debug output')
    process.exit(1)
  }

  nodes.forEach(node => {
    // Good nodes are deemed correct - they match enough other people. We only
    // Produce diagnoses for 'incorrect' nodes
    if (!isGradeA(node)) {
      console.group(chalk.bold(node.host))

      // Nodes that failed to respond, or produced unknown responses will have
      // an error property already. Just use that.
      if (node.data.error) {
        console.error(node.data.error)
      } else {
        // If the block height is doesn't match the mage node, there's no point
        // in diagnosing the error
        if (node.blockHeight !== '-' && node.blockHeight !== gradeANode.blockHeight) {
          node.data.diagnosisCode = 0
          node.data.diagnosis = 'Probably no error: node returned a different block to the mages'
          console.error(node.data.diagnosis)
        } else {
          // Hash mismatch on nodes with the same blockheight shouldn't happen.
          node.data.diagnosisCode = 1
          node.data.diagnosis = 'Node did not return good data'

          // Let's dig in...
          findIncorrectHash(node, gradeANode)
        }
      }

      console.groupEnd()
    }
  })

  return nodes
}
