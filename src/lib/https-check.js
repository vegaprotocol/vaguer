const query = `{
  epoch {
    id
  }
}`

/**
 * Some nodes are defined in the configuration with HTTPS urls. Some with HTTP urls.
 * This check is for the HTTP urls, to see if they have a corresponding HTTPS endpoint
 */
export async function httpsCheck (nodes) {
  // data.https has already been set in check.js, using looksLikeHTTPS
  await Promise.all(nodes.filter(n => {
    if (!n || !n.https || n.data.error) {
      return false
    }
    return n.data.startup.https === false
  }).map(async n => {
    const forceHTTPS = forceToHTTPS(n.host)

    if (process.env.DEBUG) {
      console.debug(`HTTPS check for TOML entry: ${n.host}`)
    }

    // Fetch the very basic GQL query above
    try {
      const res = await fetch(forceHTTPS, {
        method: 'POST',
        body: JSON.stringify({
          variables: null,
          query
        }),
        headers: {
          'Content-Type': 'application/json',
          Origin: forceHTTPS
        }
      })

      const e = await res.json()
      if (e && e.data.epoch) {
        n.https = true
        if (process.env.DEBUG) {
          console.debug(`HTTPS check: ${n.host} forced to ${forceHTTPS} works OK: toml should be updated`)
        }
      } else {
        // Shouldn't be required, but let's play safe
        n.https = false
        if (process.env.DEBUG) {
          console.debug(`HTTPS check: ${n.host} does not serve over https`)
        }
      }
    } catch (e) {
      // Shouldn't be required, but let's play safe
      n.https = false
      if (process.env.DEBUG) {
        console.debug(`HTTPS check: ${n.host} could not be fetched`)
      }
    }
  }))

  return nodes
}

/**
 * Check if a URL is https
 * @return boolean true if URL looks https-y
 */
export function looksLikeHTTPS (url) {
  try {
    const u = new URL(url)
    return u && u.protocol === 'https:'
  } catch (e) {
    return false
  }
}

/**
 * Force a url to https
 * @return string
 */
export function forceToHTTPS (url) {
  try {
    const u = new URL(url)
    u.protocol = 'https:'
    return u.toString()
  } catch (e) {
    return url
  }
}
