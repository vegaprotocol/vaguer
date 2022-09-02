/**
 * Grade. Formerly mageRank™, a system for ranking Vega data nodes
 *
 * Grade A nodes are nodes that are in the set that returned data that corresponds
 * to the most other nodes. Data is hashed in check.mjs, and this data is then used
 * to decide which hashes most likely represent the correct data given the state of
 * the network.
 *
 * Could also be referred to as the consensus set.
 */

import countBy from 'lodash.countby'
import head from 'lodash.head'
import maxBy from 'lodash.maxby'
import pairs from 'lodash.pairs'
import last from 'lodash.last'
import sample from 'lodash.sample'

// The label assigned to nodes that agree on all important data
export const grade = '🥇'

/**
 * The core grading metric, find which nodes have the same hashes
 * and which hashes are most common. Hopefully a big number
 *
 * @param nodeList Object containing rows with the property 'hashHash'
 */
export function findMostFrequentHash (nodeList) {
  const hashRank = countBy(nodeList, 'hashHash')

  // Blank may well be the most consistent hash, but we can ignores this
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
export function rank (nodeList) {
  // Get the most used hash
  const topNodeHash = findMostFrequentHash(nodeList)
  let gradeA = 0

  nodeList.forEach(r => {
    if (r.hashHash === topNodeHash) {
      r[grade] = r.hashHash === topNodeHash ? grade : '-'
      gradeA++
    } else {
      r[grade] = '-'
    }
  })

  if (gradeA < 2) {
    console.error(`Unreliable number of grade A nodes (${gradeA})`)
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
export function getGradeANode (nodeList) {
  const node = sample(nodeList.filter(r => r[grade] === grade))

  if (!node) {
    throw new Error('Insufficient Grade A Nodes Error')
  }

  return node
}

/**
 * Checks if a node is 'correct' based on a label assigned in grade
 *
 * @param Object A node that may or may not have a grade A
 * @return boolean
 */
export function isGradeA (node) {
  return (node && node[grade] === grade)
}
