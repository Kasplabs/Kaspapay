const config = require('./config.json')

const Gateway = {
  gateway: require('./src/gateway'),
  console: require('modernlog/patch')
}

const Kaspa = {
  client: require('./src/kaspa/client'),
  listener: require(`./src/kaspa/listener`),
  wallet: require(`./src/kaspa/wallet`)
}

const Database = {
  db: require(`./src/database`),
  operation: require('./src/database/operation')
}

const RPC = {
  http: require('./src/rpc/http')
}

const kaspa = new Kaspa.client(config.kaspa.nodeAddress, async () => {
  const wallet = new Kaspa.wallet(config.kaspa.wallet, async () => {
    console.log('Opened wallet successfully, starting database service...')

    const database = new Database.db(config.database.path, async () => {
      console.log('Started database service, activating listener...')

      let checkpoint = await database.execute(new Database.operation('get', {
        subDB: 'gateway',
        key: 'checkpoint'
      }))

      if (checkpoint === undefined || await kaspa.getBlock(checkpoint) === null) {
        const dagInfo = await kaspa.getBlockDAGInfo()
        
        checkpoint = dagInfo.pruningPointHash
      }
      
      const listener = new Kaspa.listener(kaspa, checkpoint, BigInt(config.kaspa.listener.requiredConfirmations))

      listener.once('ready', async () => {
        listener.on('updateCheckpoint', async (hash) => {
          await database.execute(new Database.operation('set', {
            subDB: 'gateway',
            key: 'checkpoint',
            value: hash
          }))
        })

        console.log('Listener ready, starting gateway...')

        const paymentHandler = new Gateway.gateway({
          database: database,
          kaspa: kaspa,
          wallet: wallet,
          listener: listener
        }, config.gateway)

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