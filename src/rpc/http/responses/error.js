module.exports = class ErrorResponse {
  constructor(error) {
    this.response = {
      success: false,
      error: error
    }
  }

  toJSON () {
    return this.response
  }
}