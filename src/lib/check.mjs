// Replaces the GraphQL port defined in networks.toml with the REST endpoint
export const statsWeCareAbout = ['blockHeight', 'totalPeers']
import * as sha256 from 'fast-sha256'
import stringify from 'fast-json-stable-stringify'
import sortBy from 'lodash.sortby'
import { TextEncoder } from 'util'

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
      method: "POST",
      body: JSON.stringify({
        variables: null,
        query: query
      }),
      headers: {
        'Content-Type': 'application/json',
        'Origin': urlFromConfig
      } 
    })


    stats = await res.json()
  } catch (e) {
    console.debug(`Failed to fetch ${urlFromConfig}`)
  }

  return check(urlFromConfig, stats)
}

// Chef produces a shortened hash of some data. It is a bad function name.
export function chef(object) {
    return new Buffer.from(sha256.hash(stringify(object))).toString('hex').substr(-6)
}

export function check (urlFromConfig, stats) {
  const host = urlFromConfig.replace('http://', '').replace('https://', '').replace(':3008', '').replace('.vega.community', '')
  const res = { host }
  try {
    statsWeCareAbout.forEach(key => res[key] = stats.data.statistics[key])

    const startupData = {
      appVersion: stats.data.statistics['appVersion'],
      genesisTime: stats.data.statistics['genesisTime'],
      vegaTime: stats.data.statistics['vegaTime'],
      chainId: stats.data.statistics['chainId']
    }

    // Let's hash some data
    res['steakHash'] = chef(sortBy(stats.data.nodes, 'name'))
    res['startupHash'] = chef(startupData)
    res['epochHash'] = chef(stats.data.epoch)

  } catch (e) {
    console.debug(`Failed to parse ${urlFromConfig}`)
    statsWeCareAbout.forEach(key => res[key] = '-')
  }
  return res
}
