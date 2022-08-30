import * as sha256 from 'fast-sha256'
import stringify from 'fast-json-stable-stringify'
import sortBy from 'lodash.sortby'

export function hashString (str) {
  return new Buffer.from(sha256.hash(str)).toString('hex') // eslint-disable-line new-cap
}

export function sortLists (data, sortByParam) {
  return sortBy(data, sortByParam)
}

// Stringifys an object in preparation for hashing
export function prepareForHash (data, sortByParam = false) {
  let toStringify
  if (sortByParam) {
    toStringify = sortLists(data, sortByParam)
  } else {
    toStringify = data
  }
  return hashString(stringify(toStringify))
}

/**
 * Takes the hashes of graphql data and hashes those, for one final output. Used to
 * determine which nodes match across all data
 *
 * Accepts undefined or - for hashes, given the absolute value doesn't matter
 *
 * @param res Object node object with calculated hashes
 * @return string Hash of hashes
 **/
export function listHash () {
  return hashString(Array.from(arguments).join(',').toString())
}

/**
 * Checks that there is a node list in the stake property, sorts it and then hashes the
 * output so that it can be easily compared to other nodes
 *
 * @param stats Object Node containing a `nodes` result full of node names and totalStakes
 * @param urlFromCOnfig String url for the node this result came from
 * @return Object containing `hash`, the string hash result and `data`, the input that was hashed
 **/
export function stakeHash (stats, urlFromConfig) {
  if (stats?.data?.nodes?.length > 0) {
    const stakeValues = sortBy(stats.data.nodes, 'name')
    return { hash: prepareForHash(stakeValues), data: stakeValues }
  } else {
    if (process.env.DEBUG) {
      console.debug(`No stake details from ${urlFromConfig}`)
    }
    return { hash: '-', data: undefined }
  }
}

/**
 * Checks that there is a list of network parameters, sorts it and then hashes the
 * output so that it can be easily compared to other nodes
 *
 * @param stats Object Node containing a `nodes` result full of node names and totalStakes
 * @param urlFromCOnfig String url for the node this result came from
 * @return Object containing `hash`, the string hash result and `data`, the input that was hashed
 **/
export function paramHash (stats, urlFromConfig) {
  if (stats?.data?.networkParameters?.length > 0) {
    const paramValues = sortBy(stats.data.networkParameters, 'key')
    return { hash: prepareForHash(paramValues), data: paramValues }
  } else {
    if (process.env.DEBUG) {
      console.debug(`No network parameters from ${urlFromConfig}`)
    }

    return { hash: '-', data: undefined }
  }
}
