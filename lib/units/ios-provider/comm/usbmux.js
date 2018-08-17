const usbmux = require('usbmux')
const logger = require('../lib/util/logger')

/**
 * USB multiplexer for iOS device
 - Parameter wdaPort: port number of WDA which is run on the device
 - Parameter sourcePort: port number of this machine (STF Server) which will be exposed to user who use STF
 - Returns: USBMultiplexer
 */
class USBMultiplexer {
  constructor(wdaPort, sourcePort) {
    this.wdaPort = wdaPort
    this.sourcePort = sourcePort
    this.relay = usbmux.Relay(this.wdaPort, this.sourcePort)
    this.log = logger.createLogger('ios:device:%s:%s', this.wdaPort, this.sourcePort)
  }

  attached(callback) {
    this.relay.on('attached', udid => {
      this.udid = udid
      callback(udid)
    })
  }

  detached(callback) {
    this.relay.on('detached', udid => {
      this.udid = udid
      callback(udid)
    })
  }

  connect(callback) {
    this.relay.on('connect', callback)
  }

  disconnect(callback) {
    this.relay.on('disconnect', callback)
  }

  ready(callback) {
    this.relay.on('ready', callback)
  }

  close(callback) {
    this.relay.on('close', callback)
  }
}

module.exports = USBMultiplexer

