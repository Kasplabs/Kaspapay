const crypto = require('crypto')
const { EventEmitter } = require('events')

const dbInterface = require('./interfaces/database')
const { statusCodes } = require('./constants')

module.exports = class Gateway extends EventEmitter {
  constructor (env) {
    super()

    this.db = env.database
    this.kaspa = env.kaspa
    this.kaspawallet = env.wallet
    this.listener = env.listener

    this.gatewayDB = new dbInterface(this.db) 
    this.unusedAddress = [] ?? this.kaspawallet.getAddresses() // TODO: Check existing payments in startup and remove used addresses

    process.nextTick(() => this.emit('ready'))
    this._handlePayments()
  }

  async _handlePayments () {
    const payments = await this.gatewayDB.getActivePayments()
    if (payments.length === 0) return

    for (const paymentId of payments) {
      const payment = await this.gatewayDB.getPayment(paymentId)

      // TODO: HANDLE PAYMENTS
    }

    this._handlePayments()
  }

  async createPayment (amount) {
    // TODO: Add checks (& possibly more arguments)

    const paymentId = await this.gatewayDB.generatePaymentId()
    const address = this.unusedAddress.shift() ?? await this.kaspawallet.createAddress()

    await this.gatewayDB.addPayment(paymentId, {
      timestamp: Date.now(),
      address: address,
      amount: amount,
      status: statusCodes.AWAITING_PAYMENT
    })

    this._handlePayments()
    return paymentId
  }

  async queryPayment (paymentId) {
    if (!paymentId || Buffer.from(paymentId).length !== 6) throw Error('Invalid payment id.')

    return await this.gatewayDB.getPayment(paymentId)
  }
}
