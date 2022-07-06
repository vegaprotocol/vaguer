# Vaguer

A quick hacky command line tool to check the output from a list of data nodes on a given Vega network

# Setup
```
npm install
```

# Run it
```bash
# Get the status of all data nodes on fairground
npm start fairground
# Get the status of all data nodes on mainnet1
npm start mainnet1
# Get the status of all data nodes in a given network configuration file
npm start https://raw.githubusercontent.com/vegaprotocol/networks/master/fairground/fairground.toml
```

# What am I seeing?
The hash columns are a shortened sha256 hash of some data fetched from the server, so that the consistency across nodes can be compared. A difference in hashes between two nodes means that some part of the data returned is different.

## Steak Hash
A hash of the following data, fetched from GraphQL and sorted by validator name:
- The list of all validators;
	- Their name
	- The total staked balance

Total stake can change at the end of an epoch, so a difference in hashes between nodes on different block heights is not out of the ordinary. Nodes with the same block height should not have different hashes.

## Startup Hash
A hash of the following data, fetched from GraphQL:
- Vega time
- Genesis time
- App version
- Chain ID

As Vega time is synced across nodes, this should rarely be out of sync. One field that has caused hash differences in the past is `App Version` - as of `0.52.x` the version here can be blank at compile time. 

## Epoch hash
A hash of the following data, fetched from GraphQL:
- Epoch ID
- Epoch start time
- Epoch expiry
- Epoch end time (will always be blank for the current epoch)

## Parameter hash
A hash of all of the network parameters and their configuration. As network parameters can be changed by governance, nodes at different
block heights could have different hashes, but this is unlikely to be a common occurence.

## Hash hash
A hash of all of the above hashes - essentially which nodes match in all significant state. The most common hash earns a 🧙.

## Magerank™
Magerank™ is a sophisticated (simple) proprietary algorithm (array sort) for highlighting the nodes that agree on the hashHash.

# Sample output
```
┌──────────────────────────────┬─────────────┬────────────┬───────────┬─────────────┬───────────┬───────────┬──────────┬────┐
│                         host │ blockHeight │ totalPeers │ steakHash │ startupHash │ epochHash │ paramHash │ hashHash │ 🧙 │
├──────────────────────────────┼─────────────┼────────────┼───────────┼─────────────┼───────────┼───────────┼──────────┼────┤
│                       Node 1 │           - │          - │         - │           - │         - │         - │        - │  - │
│                       Node 2 │        3341 │         10 │         - │      d175ce │    93c98e │    1c9ec1 │   8aa142 │  - │
│                       Node 3 │           - │          - │         - │           - │         - │         - │        - │  - │
│                       Node 4 │        3341 │          1 │         - │      7b29a4 │    93c98e │         - │   7d1375 │  - │
│                       Node 5 │        3341 │         10 │    8209ed │      7b29a4 │    93c98e │    6eb8d7 │   9b7cc0 │ 🧙 │
│                       Node 6 │        3341 │          9 │    8209ed │      7b29a4 │    93c98e │    6eb8d7 │   9b7cc0 │ 🧙 │
│                       Node 7 │           - │          - │         - │           - │         - │         - │        - │  - │
│                       Node 8 │        3341 │         10 │    8209ed │      7b29a4 │    93c98e │    6eb8d7 │   9b7cc0 │ 🧙 │
│                       Node 9 │           - │          - │         - │           - │         - │         - │        - │  - │
└──────────────────────────────┴─────────────┴────────────┴───────────┴─────────────┴───────────┴───────────┴──────────┴────┘

```


