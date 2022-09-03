require('modernlog/patch')
const config = require('./config.json')

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

const kaspa = new Kaspa.client(config.kaspa.nodeAddress)

console.log('Connecting to Kaspa node...')

kaspa.on('ready', () => {
  const wallet = new Kaspa.wallet(config.kaspa.wallet)

  console.log('Connected to node, opening wallet...')

  wallet.on('ready', () => {
    const listener = new Kaspa.listener()

    console.log('Opened wallet successfully, activating listener...')

    listener.on('ready', () => {
      console.log('Listener activated, starting services...')
      
      const db = new Database.db(config.database.path, () => {
        console.log('Started database service')
      })

      if (config.rpc.http.enabled) {
        const rpcHTTP = new RPC.http(config.rpc.http.port)

        console.log(`RPC:HTTP service listening on port ${config.rpc.http.port}`)
      }
    })
  })
})
