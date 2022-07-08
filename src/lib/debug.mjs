import { isMage, summonAMage } from './magerank.mjs'
import { diffJson } from 'diff'
import chalk from 'chalk'

/**
 * Produces coloured diff output for JSON where the hash differs. This shouldn't
 * happen very often, so it's worth displaying the diff to help data node operators
 * work out what the problem is
 *
 * @param hashname String title to display in the output
 * @param badProperty Object the data that went in to the hash on the node deemed incorrect
 * @param goodProperty Object the corresponding data from a maged node
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
 * diagnose a hash mismatch between nodes
 *
 * @param badNode an object containing the responses from a non-maged node
 * @param goodNode an object containing the repsonses from a known maged node
 */
export function findIncorrectHash (badNode, goodNode) {
  // Startup Hash should all be data from the network genesis
  if (badNode.startupHash !== goodNode.startupHash) {
    hashMismatchOutput('Startup', badNode.data.startup, goodNode.data.startup)
  }
  // Network paramters should be consistent, but can change due to governance
  // votes so is not reliably consistent between nodes on different block heights
  if (badNode.paramHash !== goodNode.paramHash) {
    hashMismatchOutput('Params', badNode.data.params, goodNode.data.params)
  }
  // Nodes and staked totaly change at epoch boundaries. Nodes on the same epoch
  // should have the same data, nodes on different epochs will also have different
  // epochHashes
  if (badNode.steakHash !== goodNode.steakHash) {
    hashMismatchOutput('Stake', badNode.data.steak, goodNode.data.steak)
  }
  // Epoch data should be the same across nodes but will differ between nodes at
  // different block heights.
  if (badNode.epochHash !== goodNode.epochHash) {
    hashMismatchOutput('Epoch', badNode.data.epoch, goodNode.data.epoch)
  }
}

export function debug (nodes) {
  let mage

  try {
    mage = summonAMage(nodes)
  } catch (e) {
    console.error('Not enough mages to debug output')
    process.exit(1)
  }

  nodes.forEach(node => {
    // Mage nodes are deemed correct - they match enough other people. We only
    // Produce diagnoses for 'incorrect' nodes
    if (!isMage(node)) {
      console.group(chalk.bold(node.host))

      // Nodes that failed to respond, or produced unknown responses will have
      // an error property already. Just use that.
      if (node.data.error) {
        console.error(node.data.error)
      } else {
        // If the block height is doesn't match the mage node, there's no point
        // in diagnosing the error
        if (node.blockHeight !== '-' && node.blockHeight !== mage.blockHeight) {
          node.data.diagnosisCode = 0
          node.data.diagnosis = 'Probably no error: node returned a different block to the mages'
          console.error(node.data.diagnosis)
        } else {
          // Hash mismatch on nodes with the same blockheight shouldn't happen.
          node.data.diagnosisCode = 1
          node.data.diagnosis = 'Node did not return good data'

          // Let's dig in...
          findIncorrectHash(node, mage)
        }
      }

      console.groupEnd()
    }
  })

  return nodes
}
