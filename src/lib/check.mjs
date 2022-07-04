// Replaces the GraphQL port defined in networks.toml with the REST endpoint
export const statsWeCareAbout = ['blockHeight', 'chainId', 'appVersion', 'genesisTime', 'vegaTime', 'currentTime']

export async function fetchStats (urlFromConfig) {
  const url = `${urlFromConfig}/statistics`
  let res, stats

  try {
    res = await fetch(url)
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
    statsWeCareAbout.forEach(key => res[key] = stats.statistics[key])
  } catch (e) {
    console.debug(`Failed to parse ${urlFromConfig}`)
    statsWeCareAbout.forEach(key => res[key] = '-')
  }
  return res
}
