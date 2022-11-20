module.exports = class DefaultResponse {
  constructor(result) {
    this.response = {
      success: true,
      result
    }
  }

  toJSON () {
    return this.response
  }
}