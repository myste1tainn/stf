let { exec } = require('child_process')

/**
 * Check device periodically, generate heartbeat from the information
 * When heartbeat stops, it means device has disconnected
 */
class DeviceHeartbeat {
  constructor(api: WebDriverAPI) {}

  run() {

  }
}

module.exports = new DeviceHeartbeat(new DefaultWebDriverAPI())
