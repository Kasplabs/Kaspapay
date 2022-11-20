module.exports = {
  name: 'getStatus',
  run: async ({ gateway }) => {
    return {
      activePayments: gateway.appendedAddresses.size,
      currentDAA: gateway.listener.currentDAA.toString()
    }
  }
}
