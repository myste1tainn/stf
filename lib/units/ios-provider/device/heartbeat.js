const api = require('./wda-api')
const wireutil = require('../lib/wire/util')
const wire = require('../lib/wire')
const push = require('./push')

/**
 * Check device periodically, generate heartbeat from the information
 * When heartbeat stops, it means device has disconnected
 */
class Heartbeat {
  constructor() {
    this.api = api
    this.serial = '296a0e0b33a5242977b89cd69d0be02ef1cf96f2'
  }

  run() {
      setInterval(() => this.checkHeartbeat(), 5000)
  }

  checkHeartbeat() {
    // TODO: Implement ability to monitor heartbeat of multiple devices
    this.api.status((error, response, body) => {
      if (error) {
        console.log('API status returned error', error)
        console.log(this.serial + ' heartbeat skip a beat..')
        return
      }
      if (!body) {
        console.log('Checking heartbeat got no error, but no response', response)
        return
      }
      let json = JSON.parse(body)
      if (!(json.status === 0 && json.sessionId)) {
        console.log('JSON status / session ID is not ok', json)
        console.log(this.serial + ' heartbeat skip a beat..')
        return
      }
      console.log('296a0e0b33a5242977b89cd69d0be02ef1cf96f2 heartbeat')
      push.send([
        wireutil.global,
        wireutil.envelope(new wire.DeviceHeartbeatMessage(
          this.serial
        ))
      ])
    })
  }
}

module.exports = new Heartbeat()
