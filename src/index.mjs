import { fetchStats, check } from './lib/check.mjs'
import { output } from './lib/output.mjs'
import toml from 'toml'

const configUrl = 'https://raw.githubusercontent.com/vegaprotocol/networks/master/fairground/fairground.toml'

try {
  const configRaw = await fetch(configUrl)
  const configText = await configRaw.text()

  const config = await toml.parse(configText)
  Promise.all(config.API.REST.Hosts.map(fetchStats)).then(output)
} catch (e) {
  console.error('Failed to fetch config from ')
}