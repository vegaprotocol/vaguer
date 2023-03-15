# Vaguer (formerly Grade, formerly Vaguer)

Scores data nodes against peers over time 
# Run it
The best way to run it is with npx, from github. That'll save you cloning it manually.
```bash
# Get the status of all data nodes on fairground
npx github:vegaprotocol/vaguer fairground
# Get the status of all data nodes on mainnet1
npx github:vegaprotocol/vaguer mainnet1
# The same as above, but with support for data nodes on version 0.53.0
SUPPORT_053=true npx github:vegaprotocol/vaguer mainnet1

# Get the status of all data nodes in a given network configuration file
npx github:vegaprotocol/vaguer https://raw.githubusercontent.com/vegaprotocol/networks/master/fairground/fairground.toml
# JSON output
JSON=true npx github:vegaprotocol/vaguer fairground --silent
# Prometheus output
PROMETHEUS=true npx github:vegaprotocol/vaguer fairground --silent
````

# What am I seeing?
The hash columns are a shortened sha256 hash of some data fetched from the server, so that the consistency across nodes can be compared. A difference in hashes between two nodes means that some part of the data returned is different.

* *host* is the reported name of the node, as configured in the `network.toml` for the selected network
* *blockHeight* is shown, as only nodes with the same block height are relevant. Some of the hashed data can change between blocks
* *totalPeers*  is show, but is not hashed - it's just an indicator of node health
* *steakHash* is a hash of all of the validators and their staking amounts. Nodes on the same block should have the same data.
* *marketsHash* hashes some basic information about the markets live on the network
* *assetsHash* hashes some basic information about the active assets on the network
* *governanceHash* hashes some basic information about governance proposals on the network
* *hashHash* is a hash of the above hashes, plus a hash of network information and genesis information
* *https* shows a tick if the node serves over HTTPS

The final result is that the set of nodes that are on the same height and agree on the final `hashHash` are considered to be 'correct', and the nodes that differ will
display some debugging information above the table that points to where the hashes diverge. Divergent hashes of nodes on the same block height suggest a problem with the
node, and aren't _necessarily_ critical errors.

# Sample output

| host                             | blockHeight | totalPeers | steakHash | marketsHash | assetsHash | governanceHash | hashHash | 🥇 |
|----------------------------------|:-------------:|:------------:|:-----------:|:-------------:|:------------:|:----------------:|:----------:|:----:|
| api.n06                          |           - |          - |         - |           - |          - |              - |        - |  - |
| api.n07                          |      `684744` |          `9` |    `eee0fc` |      `79af09` |     `dce206` |         `c90189` |   `05cc52` |  - |
| api.n08                          |      `684745` |          `9` |    `eee0fc` |      `2c5ee0` |     `dce206` |         `c90189` |   `d2b604` | 🥇 |
| api.n09                          |      `684744` |          `9` |    `eee0fc` |      `2c5ee0` |     `dce206` |         `c90189` |   `d69503` |  - |
| api.n10                          |      `684745` |          `9` |    `eee0fc` |      `2c5ee0` |     `dce206` |         `c90189` |   `d2b604` | 🥇 |
| api.n11                          |           - |          - |         - |           - |          - |              - |        - |  - |
| api.n12                          |      `684744` |          `9` |    `eee0fc` |      `2c5ee0` |     `dce206` |         `c90189` |   `d69503` |  - |

## Alternate output formats
For most cases, the table in the console is sufficient. JSON and Prometheus formats are available via environment variables, see above for how to use them

# [LICENSE](./LICENSE)
MIT
