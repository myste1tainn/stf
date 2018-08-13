const api = require('./wda-api')
const wireutil = require('../lib/wire/util')
const wire = require('../lib/wire')
const push = require('./push')

/**
 * Check device periodically, generate heartbeat from the information
 * When heartbeat stops, it means device has disconnected
 */
class DeviceHeartbeat {
  constructor() {
    this.api = api
  }

  run() {
    setInterval(() => this.checkHeartbeat(), 5000)
  }

  checkHeartbeat() {
    this.api.status((error, response, body) => {
      if (error) {
        console.log('API status returned error', error)
        console.log('296a0e0b33a5242977b89cd69d0be02ef1cf96f2 heartbeat skip a beat..')
        return
      }
      let json = JSON.parse(body)
      if (!(json.status === 0 && json.sessionId)) {
        console.log('JSON status / session ID is not ok', json)
        console.log('296a0e0b33a5242977b89cd69d0be02ef1cf96f2 heartbeat skip a beat..')
        return
      }
      console.log('296a0e0b33a5242977b89cd69d0be02ef1cf96f2 heartbeat')
      push.send([
        wireutil.global,
        wireutil.envelope(new wire.DeviceHeartbeatMessage(
          '296a0e0b33a5242977b89cd69d0be02ef1cf96f2'
        ))
      ])
      // push.send([
      //   wireutil.global,
      //   wireutil.envelope(new wire.DevicePresentMessage(
      //     '296a0e0b33a5242977b89cd69d0be02ef1cf96f2'
      //   ))
      // ])
    })
  }
}

module.exports = new DeviceHeartbeat()
