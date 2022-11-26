module.exports = {
  name: 'createPayment',
  run: async ({ params, gateway }) => {
    const paymentId = await gateway.createPayment(params.amount, params?.recipient)

    return { paymentId: paymentId }
  }
}
