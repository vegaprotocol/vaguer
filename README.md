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



# Sample output
```
┌────────────────────────────────────────┬─────────────┬────────────┬───────────┬─────────────┬───────────┐
│                                   host │ blockHeight │ totalPeers │ steakHash │ startupHash │ epochHash │
├────────────────────────────────────────┼─────────────┼────────────┼───────────┼─────────────┼───────────┤
│ lb.testnet.vega.xyz/datanode/gql/query │      465866 │         11 │    6fe1f5 │      be5c06 │    567e1b │
└────────────────────────────────────────┴─────────────┴────────────┴───────────┴─────────────┴───────────┘

```