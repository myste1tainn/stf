
class WebDriverAPI {
  deviceUrl
  port
  get absoluteUrl() {
    return `http://${this.deviceUrl}:${this.port}`
  }
  get defaultHeaders() {
    return {
      name: 'Content-Type',
      value: 'application/json'
    }
  }

  constructor(deviceUrl, port) {
    this.deviceUrl = deviceUrl
    this.port = port
  }

  status() {
    let path = '/status'
  }
}
