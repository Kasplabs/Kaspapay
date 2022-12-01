const { EventEmitter } = require('events')

const Payment = require('./internal/payment')
const Database = require('./interfaces/database')
const { statusCodes } = require('./constants')

module.exports = class Gateway extends EventEmitter {
  constructor (env, config) {
    super()

    this.db = env.database
    this.kaspa = env.kaspa
    this.kaspawallet = env.wallet
    this.listener = env.listener

    this.gatewayDB = new Database(this.db)

    this.kaspawallet.getAddresses().then(addresses => {
      this.listener.on('confirmedBlock', (block) => this._handleBlock(block))

      this.isActive = false
      this.appendedAddresses = new Map()
      this.unusedAddresses = addresses

      this.config = config

      process.nextTick(() => this.emit('ready'))
      this._handlePayments()
    })
  }


  async createPayment (amount, merchant) {
    const daaScore = (await this.kaspa.getBlockDAGInfo()).virtualDaaScore

    if (this.listener.currentDAA + 600n < BigInt(daaScore)) throw Error('Gateway is not synchronized.')

    const paymentId = await this.gatewayDB.generatePaymentId()
    const address = this.unusedAddresses.shift() ?? await this.kaspawallet.createAddress()

    await this.gatewayDB.addPayment(paymentId, new Payment(daaScore, merchant ?? address, address, amount))

    this._handlePayments()
    return paymentId
  }

  async getPayment (paymentId) {
    if (!paymentId) throw Error('Invalid payment id.')

    const payment = await this.gatewayDB.getPayment(paymentId)
    if (typeof payment === 'undefined') throw Error('Payment not found.')

    return payment
  }
}
