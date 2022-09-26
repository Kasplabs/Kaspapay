const crypto = require('crypto')
const { EventEmitter } = require('events')

const dbOperation = require('../database/operation')
const { statusCodes } = require('./constants')

module.exports = class Gateway extends EventEmitter {
  constructor (env) {
    super()

    this.db = env.database
    this.kaspa = env.kaspa
    this.kaspawallet = env.wallet
    this.listener = env.listener

    this.unusedAddress = []
    this.waitingPayments = new Map()

    process.nextTick(() => this.emit('ready'))
    this._handlePayments()
  }

  async _handlePayments () {
    if (this.waitingPayments.size === 0) return

    for (const paymentId of this.waitingPayments.keys()) {
      const awaitingPayment = this.waitingPayments.get(paymentId)

      if (awaitingPayment.startDate + (180 * 1000) >= Date.now()) {
        this.waitingPayments.delete(paymentId)

        this.db.execute(new dbOperation('set', {
          subDB: 'history',
          key: paymentId,
          value: {
            status: statusCodes.PAYMENT_EXPIRED,
            ...awaitingPayment
          }
        }))
      }
    }
    
    this._handlePayments()
  }

  async createPayment (amount) {
    // TODO: Add checks

    const address = this.unusedAddress.shift() ?? await this.kaspawallet.createAddress()

    const generatePID = async () => {
      const paymentId = crypto.randomBytes(6).toString('hex')
    
      if (this.waitingPayments.has(paymentId) || typeof (await this.db.execute(new dbOperation('get', { subDB: 'history', key: paymentId }))) !== 'undefined') return generatePID()
      return paymentId
    }

    const paymentId = await generatePID()
    this.waitingPayments.set(paymentId, { 
      startDate: Date.now(),
      address: address,
      amount: amount
    })

    this._handlePayments()
    return paymentId
  }
  
  async queryPayment (paymentId) {
    if (!paymentId || Buffer.from(paymentId).length !== 3) throw Error('Invalid payment id.')

    if (this.waitingPayments.get(paymentId) === 'undefined') {
      const payment = await this.db.execute(new dbOperation('get', {
        subDB: 'history',
        key: paymentId
      }))

      if (typeof payment === 'undefined') return {}
      return payment
    } else {
      return { 
        status: statusCodes.AWAITING_PAYMENT,
        ...this.waitingPayments.get(paymentId)
      }
    }
  }
}