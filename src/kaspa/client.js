const kaspajs = require('kaspajs')
const { EventEmitter } = require('events')

module.exports = class Client extends EventEmitter {
  constructor (nodeAddress, readyCallback) {
    super()

    this.client = new kaspajs.Daemon(nodeAddress, () => this._checkNode())
    this.readyCallback = readyCallback
  }

  async _checkNode () {
    const nodeInfo = await this.client.request('getInfoRequest')

    if (nodeInfo.isSynced !== true) throw Error('Node is not synchronized.')

    this.readyCallback()
    delete this.readyCallback
  }
}