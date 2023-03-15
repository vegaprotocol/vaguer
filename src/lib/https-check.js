const query = `{
  epoch {
    id
  }
`

/**
 * Some nodes are defined in the configuration with HTTPS urls. Some with HTTP urls.
 * This check is for the HTTP urls, to see if they have a corresponding HTTPS endpoint
 */
export async function httpsCheck (nodes) {
  // data.https has already been set in check.js, using looksLikeHTTPS
  await nodes.filter(n => n.data.https === false).map(async n => {
    const forceHTTPS = n.host.replace('http', 'https')

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

      const e = res.json()
      if (e && e.data.epoch) {
        n.data.https = true
      } else {
        // Shouldn't be required, but let's play safe
        n.data.https = false
      }
    } catch (e) {
      // Shouldn't be required, but let's play safe
      n.data.https = false
    }
  })

  return nodes
}

/**
 * Uses a very basic string check to see if a node looks like it's
 * serving on HTTPS
 *
 * @return boolean true if URL looks https-y
 */
export function looksLikeHTTPS (url) {
  return url && url.substring(0, 5) === 'https'
}
