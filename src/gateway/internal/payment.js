const { statusCodes } = require('../constants')

module.exports = class Payment {
  constructor (daaScore, merchant, address, amount) {
    if (typeof amount === 'undefined' || !BigInt(amount)) throw Error('Invalid amount.')
    
    this.daaScore = daaScore
    this.merchant = merchant
    this.address = address
    this.amount = amount
    this.status = statusCodes.AWAITING_PAYMENT
  }

  toJSON () {
    return {
      daaScore: this.daaScore,
      merchant: this.merchant,
      address: this.address,
      amount: this.amount,
      status: this.status
    }
  }

  static fromJSON ({ daaScore, merchant, address, amount, status }) {
    const payment = new Payment(daaScore, merchant, address, amount)

    payment.status = status

    return payment
  }
}
