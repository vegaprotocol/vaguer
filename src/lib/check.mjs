import { listHash, stakeHash, paramHash, prepareForHash } from './hash.mjs'

// Statistics to pull from the `statistics` property of the result and put on each node
const statsWeCareAbout = ['blockHeight', 'totalPeers']

// This query runs against all nodes and is the basis for the data comparison
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
  proposals {
    id
    party {
      id
      stake {
        currentStakeAvailable
      }
    }
    state
    datetime
    errorDetails
    terms {
      change {
        __typename
      }
      closingDatetime
      enactmentDatetime
    }
  }
  assets {
    id
    name
    symbol
    decimals
    quantum
    source {
      ... on ERC20 {
        contractAddress
      }
      ... on BuiltinAsset {
        maxFaucetAmountMint
      }
    }
    infrastructureFeeAccount {
      balance
    }
    globalRewardPoolAccount {
      balance
    }
  }
  markets {
    id
    name
    state
    tradingMode
    name
    accounts {
      type
      balance
    }
    data {
      auctionEnd
      auctionStart
      trigger
      markPrice
    }
  }
}`

export async function fetchStats (urlFromConfig) {
  const url = urlFromConfig

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
    const error = `Failed to fetch ${urlFromConfig} (${e.message} [${e?.cause?.code}])`

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

/**
 * Produces an empty node object for nodes that fail to connect or return
 * @param url string the URL for the node
 * @param error string the error, used in debug output
 */
function fakeCheck (url, error) {
  const res = {
    host: url,
    startupHash: '-',
    paramHash: '-',
    steakHash: '-',
    hashHash: '-',
    data: {
      error
    }
  }
  statsWeCareAbout.forEach(key => { res[key] = '-' })

  return res
}

/**
 * Given a GraphQL result from a node, hashes the data
 * so that it can be compared with the other nodes
 * @param urlFromConfig string the URL of the node
 * @param stats object The GraphQL result
 * @return array of node objects
 **/
export function check (urlFromConfig, stats) {
  const res = {
    host: urlFromConfig,
    data: {}
  }

  try {
    statsWeCareAbout.forEach(key => { res[key] = stats.data.statistics[key] })

    const startupData = {
      appVersion: stats.data.statistics.appVersion,
      genesisTime: stats.data.statistics.genesisTime,
      vegaTime: stats.data.statistics.vegaTime,
      chainId: stats.data.statistics.chainId,
      epoch: stats.data.epoch.id,
      timestamps: stats.data.epoch.timestamps
    }

    const stake = stakeHash(stats, urlFromConfig)
    const params = paramHash(stats, urlFromConfig)

    res.data.startup = startupData
    res.data.params = params.data
    res.data.steak = stake.data
    res.data.governance = stats.data.proposals
    res.data.markets = stats.data.markets
    res.data.assets = stats.data.assets

    // Let's hash some data
    res.startupHash = prepareForHash(startupData)
    res.paramHash = params.hash
    res.steakHash = stake.hash
    res.governanceHash = prepareForHash(stats.data.proposals)
    res.marketsHash = prepareForHash(stats.data.markets)
    res.assetsHash = prepareForHash(stats.data.assets)

    res.hashHash = listHash(res.startupHash, res.paramHash, res.steakHash, res.marketsHash, res.assetsHash, res.governanceHash)
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
