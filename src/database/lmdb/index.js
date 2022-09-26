const lmdb = require('lmdb')

module.exports = class DB {
  constructor (path, readyCallback) {
    this.db = lmdb.open(path)

    this.operationQueue = []

    process.nextTick(() => readyCallback())
  }

  execute (operation) {
    const promise = new Promise(resolve => {
      operation.resolve = resolve
    })

    this.operationQueue.push(operation)
    process.nextTick(() => this._drainQueue())
    
    return promise
  }

  async _drainQueue () {
    if (this.operationQueue.length === 0) return

    const operation = this.operationQueue.shift()

    if (operation.type === 'get') {
      operation.resolve(this.db.openDB(operation.subDB).get(operation.key))
    } else if (operation.type === 'set') {
      await (this.db.openDB(operation.subDB)).put(operation.key, operation.value)
      operation.resolve(true)
    }

    this._drainQueue()
  }
}