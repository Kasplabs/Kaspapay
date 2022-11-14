const { statusCodes } = require('../constants')

module.exports = class Payment {
  constructor (address, amount) {
    this.timestamp = Date.now()
    this.address = address
    this.amount = amount
    this.status = statusCodes.AWAITING_PAYMENT
  }

  toJSON () {
    return {
      timestamp: this.timestamp,
      address: this.address,
      amount: this.amount,
      status: this.status
    }
  }

  static fromJSON ({ timestamp, address, amount, status }) {
    const payment = new Payment(address, amount)

    payment.timestamp = timestamp
    payment.status = status

    return payment
  }
}