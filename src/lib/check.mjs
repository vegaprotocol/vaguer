// Replaces the GraphQL port defined in networks.toml with the REST endpoint
import * as sha256 from 'fast-sha256'
import stringify from 'fast-json-stable-stringify'
import sortBy from 'lodash.sortby'
import { TextEncoder } from 'util'

export const statsWeCareAbout = ['blockHeight', 'totalPeers']

const query = `{
  statistics {
    appVersion
    blockHeight
    chainId
    totalPeers
    genesisTime
    vegaTime
    currentTime
  }
  nodes {
    name
    stakedTotal
  }
  networkParameters {
    key
    value
  }
  epoch {
    id
    timestamps {
      start
      expiry
      end
    }
  }
}`

export async function fetchStats (urlFromConfig) {
  let url = urlFromConfig
  if (url.indexOf('query') === -1) {
    url = url + '/query'
  }
  let res, stats

  try {
    res = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        variables: null,
        query
      }),
      headers: {
        'Content-Type': 'application/json',
        Origin: urlFromConfig
      }
    })

    stats = await res.json()
  } catch (e) {
    console.debug(`Failed to fetch ${urlFromConfig} (${e.message} [${e.cause.code}])`)
    return fakeCheck(urlFromConfig)
  }

  if (!stats) {
    console.debug(`Failed to fetch ${urlFromConfig} (Empty result)`)
    return fakeCheck(urlFromConfig)
  }

  if (stats && stats.errors) {
    console.debug(`Failed to fetch ${urlFromConfig} (${JSON.stringify(stats.errors)})`)
    return fakeCheck(urlFromConfig)
  }
  return check(urlFromConfig, stats)
}

export function hashString (str) {
  return new Buffer.from(sha256.hash(str)).toString('hex').substr(-6)
}

// Chef produces a shortened hash of some data. It is a bad function name.
export function chef (object) {
  return hashString(stringify(object))
}

export function stakeChef (stats) {
  if (stats?.data?.nodes?.length > 0) {
    const stakeValues = sortBy(stats.data.nodes, 'name')
    return chef(stakeValues)
  } else {
    return '-'
  }
}

export function paramChef (stats) {
  if (stats?.data?.networkParameters?.length > 0) {
    const paramValues = sortBy(stats.data.networkParameters, 'key')
    return chef(paramValues)
  } else {
    return '-'
  }
}
export function hashList (res) {
  return hashString(`${res.steakHash}${res.startupHash}${res.epochHash}${res.paramHash}`)
}

function fakeCheck (url) {
  const res = {
    host: cleanHostname(url)
  }
  statsWeCareAbout.forEach(key => res[key] = '-')
  res.startupHash = '-'
  res.paramHash = '-'
  res.steakHash = '-'
  res.epochHash = '-'
  res.hashHash = '-'
  return res
}

function cleanHostname (url) {
  return url.replace('http://', '').replace('https://', '').replace(':3008', '').replace('.vega.community', '')
}

export function check (urlFromConfig, stats) {
  const host = cleanHostname(urlFromConfig)
  const res = { host }
  try {
    statsWeCareAbout.forEach(key => res[key] = stats.data.statistics[key])

    const startupData = {
      appVersion: stats.data.statistics.appVersion,
      genesisTime: stats.data.statistics.genesisTime,
      vegaTime: stats.data.statistics.vegaTime,
      chainId: stats.data.statistics.chainId
    }

    // Let's hash some data
    res.startupHash = chef(startupData)
    res.paramHash = paramChef(stats)
    res.steakHash = stakeChef(stats)
    res.epochHash = chef(stats.data.epoch)

    res.hashHash = hashList(res)
  } catch (e) {
    console.debug(`Failed to parse ${urlFromConfig} (${e.message}`)
    statsWeCareAbout.forEach(key => res[key] = '-')
  }
  return res
}
