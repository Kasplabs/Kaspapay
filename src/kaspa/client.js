const kaspajs = require('kaspajs')
const { EventEmitter } = require('events')

module.exports = class Client extends EventEmitter {
  constructor (nodeAddress) {
    super()

    this.client = new kaspajs.Daemon(nodeAddress, () => this.emit('ready'))
  }
}