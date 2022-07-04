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

# Sample output
```
┌───────────────────────────────────┬─────────────┬────────────────────────────────┬────────────────┬────────────┬──────────────────────┐
│                              host │ blockHeight │                       vegaTime │        chainId │ appVersion │          genesisTime │
├───────────────────────────────────┼─────────────┼────────────────────────────────┼────────────────┼────────────┼──────────────────────┤
│ lb.testnet.vega.xyz/datanode/rest │      410060 │ 2022-07-04T14:17:10.043582134Z │ testnet-49c692 │    v0.52.0 │ 2022-06-30T10:30:11Z │
└───────────────────────────────────┴─────────────┴────────────────────────────────┴────────────────┴────────────┴──────────────────────┘

```