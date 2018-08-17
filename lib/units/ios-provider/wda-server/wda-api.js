const request = require('request')

// TODO: Implement the passing and constructor function to take this parameter
let deviceUrl = 'localhost'
let port = 10000

class WebDriverAPI {

  static get defaultHeaders() {
    return {
      name: 'Content-Type',
      value: 'application/json'
    }
  }

  constructor() {
    this.deviceUrl = deviceUrl
    this.port = port
  }

  url(path) {
    return `http://${this.deviceUrl}:${this.port}${path}`
  }

  status(callback) {
    let options = {
      url: this.url('/status'),
      headers: WebDriverAPI.defaultHeaders
    }
    // TODO: Use Promisify maybe better suited this.
    request(options, callback)
  }
}

module.exports = new WebDriverAPI()
