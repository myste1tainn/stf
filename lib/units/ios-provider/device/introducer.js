const muxAllocator = require('../comm/usbmux-allocator')
const push = require('../comm/push')
const wireutil = require('../../../wire/util')
const solo = wireutil.makePrivateChannel()

class Introducer {
  constructor(sourcePort) {
    this.sourcePort = sourcePort
    this.mux = muxAllocator.mux(sourcePort)
    this.mux.ready(this.ready)
    this.mux.attached(this.introduce)
  }

  introduce(serial) {
    let readyMessage = new wire.DeviceReadyMessage(serial, wireutil.global)
    push.send([wireutil.global, wireutil.envelope(readyMessage)])
  }

  ready(serial) {
    let providerMessage = new wire.ProviderMessage(solo, 'Mysteltain.local')
    let introductionMessage = new wire.DeviceIntroductionMessage(serial, wireutil.toDeviceStatus('device'), providerMessage)
    push.send([wireutil.global, wireutil.envelope(introductionMessage)])
  }
}

module.exports = Introducer
