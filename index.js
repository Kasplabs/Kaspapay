const config = require('./config.json')

const Gateway = {
  gateway: require('./src/gateway'),
  console: require('modernlog/patch')
}

const Kaspa = {
  client: require('./src/kaspa/client'),
  listener: require(`./src/kaspa/listeners/${config.kaspa.listener.type}`),
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
    console.log('Opened wallet successfully, starting database service...')

    const database = new Database.db(config.database.path, () => {
      console.log('Started database service, activating listener...')

      // TODO: Check if checkpoint exists from db and if not get pruning point and continue from it.
      
      const listener = new Kaspa.listener(kaspa, '3fa82242e322bb7f2556e794328c6705319d4a8edb63975ff945b433ab065595', BigInt(config.kaspa.listener.requiredConfirmations))

      listener.once('ready', () => {
        console.log('Listener activated, starting gateway...')

        const paymentHandler = new Gateway.gateway({
          database: database,
          kaspa: kaspa,
          wallet: wallet,
          listener: listener
        })

        paymentHandler.once('ready', () => {
          console.log('Gateway is active! starting enabled services...')

          if (config.rpc.http.enabled) {
            new RPC.http(config.rpc.http.port, paymentHandler, () => {
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
