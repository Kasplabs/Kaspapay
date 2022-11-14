module.exports = {
  name: 'createPayment',
  run: async ({ params, gateway }) => {
    const paymentId = await gateway.createPayment(params.amount)

    return { paymentId: paymentId }
  }
}
