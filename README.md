# Vaguer (formerly Grade, formerly Vaguer)

Scores data nodes against peers over time 

# Run it
```bash
npm install
# Get the status of all data nodes on fairground
npm start fairground
# Get the status of all data nodes on mainnet1
npm start mainnet1
# Get the status of all data nodes in a given network configuration file
npm start https://raw.githubusercontent.com/vegaprotocol/networks/master/fairground/fairground.toml
```

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

The final result is that the set of nodes that are on the same height and agree on the final `hashHash` are considered to be 'correct', and the nodes that differ will
display some debugging information above the table that points to where the hashes diverge. Divergent hashes of nodes on the same block height suggest a problem with the
node, and aren't _necessarily_ critical errors.

# Sample output
```
┌──────────────────────────────┬─────────────┬────────────┬───────────┬─────────────┬────────────┬────────────────┬──────────┬────┐
│                         host │ blockHeight │ totalPeers │ steakHash │ marketsHash │ assetsHash │ governanceHash │ hashHash │ 🧙 │
├──────────────────────────────┼─────────────┼────────────┼───────────┼─────────────┼────────────┼────────────────┼──────────┼────┤
│                       Node 1 │           - │          - │         - │           - │          - │              - │        - │  - │
│                 Data  node 2 │     1108876 │         10 │    a2e0f5 │      b81119 │     5c549f │         b81119 │   1cd442 │  - │
│                       Node 3 |           - │          - │         - │           - │          - │              - │        - │  - │
│                       Node 4 │     1108876 │         10 │    a2e0f5 │      b81119 │     5c549f │         b81119 │   9a51b1 │  - │
│                       Node 5 │     1108877 │         10 │    a2e0f5 │      b81119 │     5c549f │         b81119 │   c5877a │ 🧙 │
│                 Another node │     1108877 │         21 │    a2e0f5 │      b81119 │     5c549f │         b81119 │   c5877a │ 🧙 │
│                Node number 6 │           - │          - │         - │           - │          - │              - │        - │  - │
│                       Node 7 │           - │          - │         - │           - │          - │              - │        - │  - │
│                  Test node 8 │     1108877 │         11 │    a2e0f5 │      b81119 │     5c549f │         b81119 │   c5877a │ 🧙 │
│                  Data node 9 │     1108877 │         21 │    a2e0f5 │      b81119 │     5c549f │         b81119 │   c5877a │ 🧙 │
│                       node10 │           - │          - │         - │           - │          - │              - │        - │  - │
│                   Node Name  │     1108877 │         21 │    a2e0f5 │      b81119 │     5c549f │         b81119 │   c5877a │ 🧙 │
│              Example node 12 │     1108877 │         10 │    a2e0f5 │      b81119 │     5c549f │         b81119 │   c5877a │ 🧙 │
└──────────────────────────────┴─────────────┴────────────┴───────────┴─────────────┴────────────┴────────────────┴──────────┴────┘
```

# [LICENSE](./LICENSE)
MIT
