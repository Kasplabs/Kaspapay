const dbOperation = require('../../database/operation')
const Payment = require('../internal/payment')
const { statusCodes } = require('../constants')

const crypto = require('crypto')

module.exports = class DatabaseInterface {
  constructor (db) {
    this.db = db
  }

  async generatePaymentId () {
    const generatePID = async () => {
      const paymentId = crypto.randomBytes(6).toString('hex')

      if (await this.getPayment(paymentId) !== undefined) return generatePID()
      return paymentId
    }

    return await generatePID()
  }

  async getActivePayments () {
    return (await this.db.execute(new dbOperation('get', { subDB: 'payments', key: "activePayments", }))) ?? []
  }

  async getPayment (paymentId) {
    return Payment.fromJSON(await this.db.execute(new dbOperation('get', { subDB: 'payments', key: paymentId, })))
  }

  async addPayment (paymentId, payment) {
    const activePayments = await this.getActivePayments()
    activePayments.push(paymentId)

    await this.db.execute(new dbOperation('set', { subDB: 'payments', key: paymentId, value: payment.toJSON() }))
    await this.db.execute(new dbOperation('set', { subDB: 'payments', key: 'activePayments', value: activePayments }))
  }

  async updatePayment (paymentId, status) {
    const payment = await this.db.execute(new dbOperation('get', { subDB: 'payments', key: paymentId, }))

    if (payment.status !== statusCodes.AWAITING_PAYMENT) throw Error(`It's a finalized payment`)

    payment.status = status

    const activePayments = await this.getActivePayments()
    activePayments = activePayments.filter((payment) => { payment !== paymentId })

    await this.db.execute(new dbOperation('set', { subDB: 'payments', key: paymentId, value: payment }))
    await this.db.execute(new dbOperation('set', { subDB: 'payments', key: 'activePayments', value: activePayments }))
  }
}