const { statusCodes } = require('../constants')

module.exports = class Payment {
  constructor (daaScore, address, recipient, amount) {
    if (typeof amount === 'undefined' || !BigInt(amount)) throw Error('Invalid amount.')
    this.daaScore = daaScore
    this.address = address
    this.recipient = recipient
    this.amount = amount
    this.status = statusCodes.AWAITING_PAYMENT
  }

  toJSON () {
    return {
      daaScore: this.daaScore,
      address: this.address,
      recipient: this.recipient,
      amount: this.amount,
      status: this.status
    }
  }

  static fromJSON ({ daaScore, recipient, address, amount, status }) {
    const payment = new Payment(daaScore, address, recipient, amount)

    payment.status = status

    return payment
  }
}