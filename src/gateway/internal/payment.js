const { statusCodes } = require('../constants')

module.exports = class Payment {
  constructor (daaScore, paymentAddress, merchantAddress, amount, data) {
    if (typeof amount === 'undefined' || !BigInt(amount)) throw Error('Invalid amount.')
    
    this.daaScore = daaScore
    this.paymentAddress = paymentAddress
    this.merchantAddress = merchantAddress
    this.amount = amount
    this.data = data
    this.status = statusCodes.AWAITING_PAYMENT
  }

  toJSON () {
    return {
      daaScore: this.daaScore,
      paymentAddress: this.paymentAddress,
      merchantAddress: this.merchantAddress,
      amount: this.amount,
      data: this.data,
      status: this.status
    }
  }

  static fromJSON ({ daaScore, paymentAddress, merchantAddress, amount, data, status }) {
    const payment = new Payment(daaScore, paymentAddress, merchantAddress, amount, data)

    payment.status = status

    return payment
  }
}
