import { fetchStats } from './lib/check.mjs'
import { output } from './lib/output.mjs'
import { debug } from './lib/debug.mjs'
import { rank } from './lib/grade.mjs'
import validUrl from 'valid-url'
import minimist from 'minimist'
import toml from 'toml'

const knownConfigUrls = {
  fairground: 'https://raw.githubusercontent.com/vegaprotocol/networks/master/fairground/fairground.toml',
  mainnet1: 'https://raw.githubusercontent.com/vegaprotocol/networks/master/mainnet1/mainnet1.toml'
}

// Fetch a toml file containing the list of data nodes to check
let configUrl = false
const args = minimist(process.argv.slice(2))
const network = args._[0]

if (knownConfigUrls[network]) {
  configUrl = knownConfigUrls[network]
} else {
  if (validUrl.isUri(network)) {
    configUrl = network
  } else {
    console.error(`Please select a known network from: ${Object.keys(knownConfigUrls).join(',')}, or enter your URL to a toml file`)
    process.exit()
  }
}

// Process the network toml file
try {
  const configRaw = await fetch(configUrl)
  const configText = await configRaw.text()

  const config = await toml.parse(configText)

  // Fetch the same data from all nodes and process it
  Promise.all(config.API.GraphQL.Hosts.map(fetchStats))
    .then(rank)
    .then(debug)
    .then(output)
} catch (e) {
  console.error(`Failed to fetch config from ${configUrl}`)
}
