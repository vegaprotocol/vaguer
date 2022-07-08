import countBy from 'lodash.countby'
import head from 'lodash.head'
import maxBy from 'lodash.maxby'
import pairs from 'lodash.pairs'
import last from 'lodash.last'
import sample from 'lodash.sample'
const mage = '🧙'

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

  nodeList.forEach(r => {
    if (r.hash === '-') {
      r[mage] = '-'
    } else {
      r[mage] = r.hashHash === mageWorthy ? mage : '-'
    }
  })

  return nodeList
}

export function giveMeARandomMage (nodeList) {
  return sample(nodeList.filter(r => r[mage] === mage))
}

export function isMage (node) {
  return (node[mage] === mage)
}
