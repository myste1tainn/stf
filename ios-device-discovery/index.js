const iosDevice = require('node-ios-device')
const wireutil = require('../lib/wire/util')
const wire = require('../lib/wire')
const solo = wireutil.makePrivateChannel()
const push = require('./push')

iosDevice.trackDevices().on('devices', function(devices) {
  devices.forEach(device => {
    push.send([
      wireutil.global,
      wireutil.envelope(new wire.DeviceIntroductionMessage(
        device.udid,
        wireutil.toDeviceStatus('device'),
        new wire.ProviderMessage(
          solo,
          'Mysteltain.local'
        )
      ))
    ])

    setTimeout(function() {
      push.send([
        wireutil.global,
        wireutil.envelope(new wire.DeviceReadyMessage(
          device.udid,
          wireutil.global
          )
        )
      ])
    }, 1000)


    setTimeout(function() {
    }, 2000)
  })
})

require('./wda-server').restart()
  .then(() => require('./device-heartbeat').run())
  .catch(e => console.log('WDA server boot-up failed', e))

