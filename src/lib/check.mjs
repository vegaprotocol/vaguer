// Replaces the GraphQL port defined in networks.toml with the REST endpoint
export const statsWeCareAbout = ['blockHeight', 'chainId', 'appVersion', 'totalPeers', 'vegaTime']
export const dataWeCareAbout = ['id']
import * as sha256 from 'fast-sha256'
import stringify from 'fast-json-stable-stringify'
import sortBy from 'lodash.sortby'
import { TextEncoder } from 'util'

const query = `{
  statistics {
    blockHeight
    chainId
    appVersion
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

export function check (urlFromConfig, stats) {
  const host = urlFromConfig.replace('http://', '').replace('https://', '')
  const res = { host }
  try {
    statsWeCareAbout.forEach(key => res[key] = stats.data.statistics[key])
    dataWeCareAbout.forEach(key => res[key] = stats.data.epoch[key])

    // Let's hash some data
    const d = sortBy(stats.data.nodes, 'name')

    const hashResult = new Buffer.from(sha256.hash(stringify(d))).toString('hex').substr(-6)
    res['steakHash'] = hashResult;
  } catch (e) {
    console.debug(`Failed to parse ${urlFromConfig}`)
    statsWeCareAbout.forEach(key => res[key] = '-')
  }
  return res
}
