const { EventEmitter } = require('events')

module.exports = class Listener extends EventEmitter {
  constructor (kaspa, startHash) {
    super()

    this.kaspa = kaspa

    this.listeningAddrs = new Set()
    this.currentHash = startHash

    this.listen()
    process.nextTick(() => this.emit('ready'))
  }

  addAddress (kaspaAddress) {
    this.listeningAddrs.add(kaspaAddress)
  }

  removeAddress (kaspaAddress) {
    this.listeningAddrs.delete(kaspaAddress)
  }

  async listen () {
    console.log(await this.kaspa.client.request('getBlocksRequest', {
      lowHash: this.currentHash,
      includeBlocks: true,
      includeTransactions: true
    }))

    this.listen()
  }
}