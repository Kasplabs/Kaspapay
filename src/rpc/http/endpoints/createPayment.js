const Response = require('./responses/default')
const ErrorResponse = require('./responses/error')

module.exports = {
  name: 'createPayment',
  run: async ({ params, gateway }) => {
    const paymentId = await gateway.createPayment(params.amount).catch(err => {
      return new ErrorResponse(err)
    })

    return new Response({ paymentId: paymentId })
  }
}
