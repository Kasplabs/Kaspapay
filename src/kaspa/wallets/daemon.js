const kaspajs = require('kaspajs')
const { EventEmitter } = require('events')

module.exports = class Wallet extends EventEmitter {
  constructor(config) {
    super()
    
    this.wallet = new kaspajs.WalletDaemon(config.daemonAddress, () => this.emit('ready'))
  }
}