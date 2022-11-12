const { EventEmitter } = require('events')

module.exports = class Listener extends EventEmitter {
  constructor (kaspa, startHash, confirmations) {
    super()

    this.kaspa = kaspa

    this.listen(startHash, confirmations)
    process.nextTick(() => this.emit('ready'))
  }

  listen (startHash, confirmations) {
    this.currentHash = startHash
    this.waitingBlocks = []

    const pollBlocks = async () => {
      const blueScore = BigInt((await this.kaspa.client.request('getVirtualSelectedParentBlueScoreRequest')).blueScore)

      const blocks = await this.kaspa.client.request('getBlocksRequest', {
        lowHash: this.currentHash,
        includeBlocks: true,
        includeTransactions: true
      })

      const chainBlocks = blocks.blocks.filter((block) => block.verboseData.isChainBlock)
      chainBlocks.shift()

      for (const block of chainBlocks) {
        const blockScore = BigInt(block.verboseData.blueScore)

        if (blockScore + confirmations >= blueScore) {
          this.emit('confirmedBlock', block)

          this.currentHash = block.verboseData.hash
        }
      }

      pollBlocks()
    }

    pollBlocks()
  }
}
