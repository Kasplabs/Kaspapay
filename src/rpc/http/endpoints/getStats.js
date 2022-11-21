module.exports = {
  name: 'getStats',
  run: async ({ gateway }) => {
    return {
      gatewayUptime: Math.floor(process.uptime() * 1000),
      totalPayments: gateway.gatewayDB.getTotalPayments(),
      activePayments: gateway.appendedAddresses.size,
      currentDAA: gateway.listener.currentDAA.toString(),
      currentHash: gateway.listener.currentHash
    }
  }
}
