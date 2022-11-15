const { statusCodes } = require('../constants')

module.exports = class Payment {
  constructor (address, recipient, amount) {
    if (typeof amount === 'undefined' || !BigInt(amount)) throw Error('Invalid amount.')
    this.timestamp = Date.now()
    this.address = address
    this.recipient = recipient
    this.amount = amount
    this.status = statusCodes.AWAITING_PAYMENT
  }

  toJSON () {
    return {
      timestamp: this.timestamp,
      address: this.address,
      recipient: this.recipient,
      amount: this.amount,
      status: this.status
    }
  }

  static fromJSON ({ timestamp, recipient, address, amount, status }) {
    const payment = new Payment(address, recipient, amount)

    payment.timestamp = timestamp
    payment.status = status

    return payment
  }
}