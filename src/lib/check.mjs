// Replaces the GraphQL port defined in networks.toml with the REST endpoint
export const statsWeCareAbout = ['blockHeight', 'vegaTime', 'chainId', 'appVersion', 'genesisTime']

export async function fetchStats(urlFromConfig) {
	let url = `${urlFromConfig}/statistics`
	let res, stats, data

	try {
		res = await fetch(url)
		stats = await res.json()
	} catch (e) {
		console.debug(`Failed to fetch ${urlFromConfig}`)
	}

	return data = check(urlFromConfig, stats)
}

export function check(urlFromConfig, stats) {
	const host = urlFromConfig.replace('http://', '').replace('https://', '')
	const res = { host: host }
	try {
		statsWeCareAbout.map(key => res[key] = stats.statistics[key])
	} catch (e) {
		console.debug(`Failed to parse ${urlFromConfig}`)
		statsWeCareAbout.map(key => res[key] = '-')
	}
	return res
}