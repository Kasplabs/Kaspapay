module.exports.Response = class Response {
  constructor (result) {
    this.response = {
      success: true,
      result
    }
  }

  toJSON () {
    return this.response
  }
}

module.exports.ErrorResponse = class ErrorResponse {
  constructor (error) {
    this.response = {
      success: false,
      error: error
    }
  }

  toJSON () {
    return this.response
  }
}
