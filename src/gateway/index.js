const { EventEmitter } = require('events')

const Payment = require('./internal/payment')
const Database = require('./interfaces/database')
const { statusCodes } = require('./constants')

module.exports = class Gateway extends EventEmitter {
  constructor (env, payTimeout) {
    super()

    this.db = env.database
    this.kaspa = env.kaspa
    this.kaspawallet = env.wallet
    this.listener = env.listener

    this.gatewayDB = new Database(this.db)

    this.kaspawallet.getAddresses().then(addresses => {
      this.listener.on('confirmedBlock', (block) => this._handleBlock(block))

      this.appendedAddresses = new Map()
      this.unusedAddresses = addresses

      this.payTimeout = BigInt(payTimeout)

      process.nextTick(() => this.emit('ready'))
      this._handlePayments()  
    })
  }

  async _handleBlock (block) {
    for (const transaction of block.transactions) {
      for (const output of transaction.outputs) {
        if (this.appendedAddresses.has(output.verboseData.scriptPublicKeyAddress)) {
          const paymentId = this.appendedAddresses.get(output.verboseData.scriptPublicKeyAddress)
          const payment = await this.gatewayDB.getPayment(paymentId)
  
          if (payment.amount === output.amount) {
            await this.gatewayDB.updatePayment(paymentId, statusCodes.PAYMENT_COMPLETED)
            if (payment.address !== payment.recipient) {
              await this.kaspawallet.sendPayment(payment.address, payment.recipient, payment.amount)
            }
            
            this.unusedAddresses.push(payment.address)
            this.appendedAddresses.delete(payment.address)
          }
        }
      }
    }
  }

  async _handlePayments () {
    const payments = await this.gatewayDB.getActivePayments()
    if (payments.length === 0) return

    for (const paymentId of payments) {
      const payment = await this.gatewayDB.getPayment(paymentId)

      if (BigInt(payment.daaScore) + this.payTimeout + this.listener.confirmationCount < this.listener.currentDAA) { // TODO: Make confirmation gap dynamic by config value
        this.gatewayDB.updatePayment(paymentId, statusCodes.PAYMENT_EXPIRED)

        this.unusedAddresses.push(payment.address)
        this.appendedAddresses.delete(payment.address)
      } else {
        this.unusedAddresses = this.unusedAddresses.filter((address) => { return address !== payment.address })
        this.appendedAddresses.set(payment.address, paymentId)
      }
    }

    setTimeout(() => this._handlePayments(), 1000)
  }

  async createPayment (amount, recipient) {
    const daaScore = (await this.kaspa.getBlockDAGInfo()).virtualDaaScore

    if (this.listener.currentDAA + 600n < BigInt(daaScore)) throw Error("Gateway is not synchronized.")
    
    const paymentId = await this.gatewayDB.generatePaymentId()
    const address = this.unusedAddresses.shift() ?? await this.kaspawallet.createAddress()
    
    await this.gatewayDB.addPayment(paymentId, new Payment(daaScore, address, recipient ?? address, amount))

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
