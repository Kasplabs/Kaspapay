module.exports = class Operation {
  constructor (type, operation) {
    if (type !== 'get' && type !== 'set') throw Error('Invalid operation type')
    if (typeof operation.subDB === 'undefined' || typeof operation.key === 'undefined') throw Error('Invalid operation contents')
    if (type === 'set' && typeof operation.value === 'undefined') throw Error('Invalid operation value')

    this.type = type

    this.subDB = operation.subDB
    this.key = operation.key

    if (this.type === 'set') {
      this.value = operation.value
    }
  }
}
