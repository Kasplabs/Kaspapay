const Response = require('./responses/default')
const ErrorResponse = require('./responses/error')

module.exports = {
  name: 'getPayment',
  run: async ({ params, gateway }) => {
    const payment = await gateway.getPayment(params.paymentId).catch(err => {
      return new ErrorResponse(err)
    })

    return new Response({ payment: payment })
  }
}
