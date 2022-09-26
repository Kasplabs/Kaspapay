const { EventEmitter } = require('events')

module.exports = class Listener extends EventEmitter {
  constructor (kaspa) {
    super()

    this.kaspa = kaspa
    this.listeningAddrs = new Set()

    process.nextTick(() => this.emit('ready'))
  }

  addAddress (kaspaAddress) {
    this.listeningAddrs.add(kaspaAddress)
  }

  removeAddress (kaspaAddress) {
    this.listeningAddrs.delete(kaspaAddress)
  }

  listen () {
    const cachedBlocks = new Map()
    const transactionsPerBlock = {}
    const waitingTransactions = {}

    this.kaspa.subscribe('notifyBlockAddedRequest', {}, (data) => {
      knownBlocks.set(data.block.verboseData.hash, data.block)
  
      data.block.transactions.forEach(transaction => {
        let isRelated = false

        transaction.outputs.forEach(utxo => {
          if (this.listeningAddrs.has(utxo.verboseData.scriptPublicKeyAddress)) { isRelated = true }
        })
  
        if (!isRelated) return
  
        transaction.
        waitingTransactions[transaction.verboseData.transactionId] = transaction
      })
    })
  }
}