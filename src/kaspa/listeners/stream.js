const { EventEmitter } = require('events')

module.exports = class Listener extends EventEmitter {
  constructor (kaspa) {
    super()

    this.kaspa = kaspa
    this.listenAddresses = new Set()

    process.nextTick(() => this.emit('ready'))
  }

  addAddress (kaspaAddress) {
    this.listenAddresses.add(kaspaAddress)
  }
}