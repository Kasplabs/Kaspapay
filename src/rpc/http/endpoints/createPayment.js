module.exports = {
  name: 'createPayment',
  run: async ({ params, gateway }) => {
    const paymentId = await gateway.createPayment(params?.merchant, params.amount, params?.data)

    return { paymentId: paymentId }
  }
}
