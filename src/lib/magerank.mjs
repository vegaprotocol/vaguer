/**
 * mageRank™, a system for ranking Vega data nodes
 *
 * 'maged' nodes are nodes that are in the set that returned data that corresponds
 * to the most other nodes. Data is hashed in check.mjs, and this data is then used
 * to decide which hashes most likely represent the correct data given the state of
 * the network.
 */

import countBy from 'lodash.countby'
import head from 'lodash.head'
import maxBy from 'lodash.maxby'
import pairs from 'lodash.pairs'
import last from 'lodash.last'
import sample from 'lodash.sample'

// The label assigned to node sthat agree on all important data
export const mage = '🧙'

/**
 * The core of mageRank™, find which nodes have the same hashes
 * and which hashes are most common. Hopefully a big number
 *
 * @param nodeList Object containing rows with the property 'hashHash'
 */
export function findMostFrequentHash (nodeList) {
  const hashRank = countBy(nodeList, 'hashHash')

  // Blank may well be the most consistent hash, but mageRank™ ignores this
  delete hashRank['-']

  const hashAndRank = pairs(hashRank)
  const mostCommonHashAndRank = maxBy(hashAndRank, last)
  const mostCommonHash = head(mostCommonHashAndRank)

  return mostCommonHash
}

/**
 * Rank nodes by how many other nodes the hashlist matches
 * Note: this mutates the parameter
 *
 * @param nodeList Object to rank
 */
export function mageRank (nodeList) {
  // Get the most used hash
  const mageWorthy = findMostFrequentHash(nodeList)
  let mages = 0

  nodeList.forEach(r => {
    if (r.hashHash === mageWorthy) {
      r[mage] = r.hashHash === mageWorthy ? mage : '-'
      mages++
    } else {
      r[mage] = '-'
    }
  })

  if (mages < 2) {
    console.error(`Unreliable number of mages (${mages})`)
  }

  return nodeList
}

/**
 * Grab a single 'correct' node from the node list
 * and return it. Mainly used to compare 'good' hashes to
 * 'bad' hashes. Uses lodash.sample for randomness.
 *
 * @param nodeList array Array of node objects
 * @return Object a single node
 */
export function summonAMage (nodeList) {
  const summonedMage = sample(nodeList.filter(r => r[mage] === mage))

  if (!summonedMage) {
    throw new Error('Insufficient Mage Error')
  }

  return summonedMage
}

/**
 * Checks if a node is 'correct' based on a label assigned in mageRank
 *
 * @param Object A node that may or may not have a mage label
 * @return boolean
 */
export function isMage (node) {
  return (node && node[mage] === mage)
}
