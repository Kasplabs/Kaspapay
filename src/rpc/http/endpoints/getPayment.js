module.exports = {
  name: 'getPayment',
  run: async ({ params, gateway }) => {
    const payment = await gateway.getPayment(params.paymentId, params?.recipient)

    return payment
  }
}
