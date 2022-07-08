// Replaces the GraphQL port defined in networks.toml with the REST endpoint
import * as sha256 from 'fast-sha256'
import stringify from 'fast-json-stable-stringify'
import sortBy from 'lodash.sortby'

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

    if (process.env.DEBUG) {
      console.group(`========= ${urlFromConfig} ========`)
      console.dir(stats, { depth: 5 })
      console.groupEnd(`========= ${urlFromConfig} ========`)
    }
  } catch (e) {
    const error = `Failed to fetch ${urlFromConfig} (${e.message} [${e.cause.code}])`

    if (process.env.DEBUG) {
      console.debug(error)
    }

    return fakeCheck(urlFromConfig, error)
  }

  if (!stats) {
    const error = `Failed to fetch ${urlFromConfig} (Empty result)`

    if (process.env.DEBUG) {
      console.debug(error)
    }

    return fakeCheck(urlFromConfig, error)
  }

  if (stats && stats.errors) {
    const error = `Failed to fetch ${urlFromConfig} (${JSON.stringify(stats.errors)})`

    if (process.env.DEBUG) {
      console.debug(error)
    }

    return fakeCheck(urlFromConfig, error)
  }

  return check(urlFromConfig, stats)
}

export function hashString (str) {
  return new Buffer.from(sha256.hash(str)).toString('hex') // eslint-disable-line new-cap
}

// Chef produces a shortened hash of some data. It is a bad function name.
export function chef (object) {
  return hashString(stringify(object))
}

export function stakeChef (stats, urlFromConfig) {
  if (stats?.data?.nodes?.length > 0) {
    const stakeValues = sortBy(stats.data.nodes, 'name')
    return { hash: chef(stakeValues), data: stakeValues }
  } else {
    if (process.env.DEBUG) {
      console.debug(`No stake details from ${urlFromConfig}`)
    }
    return { hash: '-', data: undefined }
  }
}

export function paramChef (stats, urlFromConfig) {
  if (stats?.data?.networkParameters?.length > 0) {
    const paramValues = sortBy(stats.data.networkParameters, 'key')
    return { hash: chef(paramValues), data: paramValues }
  } else {
    if (process.env.DEBUG) {
      console.debug(`No network parameters from ${urlFromConfig}`)
    }

    return { hash: '-', data: undefined }
  }
}
export function hashList (res) {
  return hashString(`${res.steakHash}${res.startupHash}${res.epochHash}${res.paramHash}`)
}

function fakeCheck (url, error) {
  const res = {
    host: cleanHostname(url)
  }
  statsWeCareAbout.forEach(key => { res[key] = '-' })
  res.startupHash = '-'
  res.paramHash = '-'
  res.steakHash = '-'
  res.epochHash = '-'
  res.hashHash = '-'
  res.data = {
    error
  }

  return res
}

function cleanHostname (url) {
  return url.replace('http://', '').replace('https://', '').replace(':3008', '').replace('.vega.community', '')
}

export function check (urlFromConfig, stats) {
  const host = cleanHostname(urlFromConfig)
  const res = { host, data: {} }
  try {
    statsWeCareAbout.forEach(key => { res[key] = stats.data.statistics[key] })

    const startupData = {
      appVersion: stats.data.statistics.appVersion,
      genesisTime: stats.data.statistics.genesisTime,
      vegaTime: stats.data.statistics.vegaTime,
      chainId: stats.data.statistics.chainId
    }

    const stake = stakeChef(stats, urlFromConfig)
    const params = paramChef(stats, urlFromConfig)

    res.data.startup = startupData
    res.data.params = params.data
    res.data.steak = stake.data
    res.data.epoch = stats.data.epoch

    // Let's hash some data
    res.startupHash = chef(startupData)
    res.paramHash = params.hash
    res.steakHash = stake.hash
    res.epochHash = chef(stats.data.epoch)

    res.hashHash = hashList(res)
  } catch (e) {
    const error = `Failed to parse ${urlFromConfig} (${e.message}`

    if (process.env.DEBUG) {
      console.debug(error)
    }

    statsWeCareAbout.forEach(key => { res[key] = '-' })
    res.data = { error }
  }
  return res
}
