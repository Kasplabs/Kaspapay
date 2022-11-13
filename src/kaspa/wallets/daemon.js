const kaspajs = require('kaspajs')
const { EventEmitter } = require('events')

module.exports = class Wallet extends EventEmitter {
  constructor (config, readyCallback) {
    super()

    this.wallet = new kaspajs.walletDaemon(config, () => readyCallback())
  }

  async getAddresses () {
    return await this.wallet.getAddresses()
  }

  async createAddress () {
    return (await this.wallet.createAddress())[0]
  }
}
