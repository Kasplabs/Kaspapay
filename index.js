const config = require('./config.json')

const Gateway = {
  gateway: require('./src/gateway'),
  console: require('modernlog/patch')
}

const Kaspa = {
  client: require('./src/kaspa/client'),
  listener: require(`./src/kaspa/listeners/${config.kaspa.listenerType}`),
  wallet: require(`./src/kaspa/wallets/${config.kaspa.wallet.type}`)
}

const Database = {
  operation: require('./src/database/operation'),
  db: require(`./src/database/${config.database.type}`)
}

const RPC = {
  http: require('./src/rpc/http')
}

const kaspa = new Kaspa.client(config.kaspa.nodeAddress, () => {
  const wallet = new Kaspa.wallet(config.kaspa.wallet.daemonAddress, () => {
    const listener = new Kaspa.listener()

    console.log('Opened wallet successfully, activating listener...')

    listener.once('ready', () => {
      console.log('Listener activated, starting database service...')
      
      const database = new Database.db(config.database.path, () => {
        console.log('Started database service, starting gateway...')

        const paymentHandler = new Gateway.gateway({
          database,
          kaspa,
          wallet,
          listener
        })

        paymentHandler.once('ready', () => {
          console.log('Gateway active! starting enabled services...')

          if (config.rpc.http.enabled) {
            new RPC.http(config.rpc.http.port, () => {
              console.log(`RPC:HTTP service listening on port ${config.rpc.http.port}.`)
            })
          }
        })
      })
    })
  })

  console.log('Connected to node, opening wallet...')
})

console.log('Connecting to Kaspa node...')