var iosDevice = require('node-ios-device')
var zmqutil = require('../lib/util/zmqutil')
var wireutil = require('../lib/wire/util')
var wire = require('../lib/wire')
var srv = require('../lib/util/srv')
var solo = wireutil.makePrivateChannel()
var Promise = require('bluebird')


let endpoints = ['tcp://127.0.0.1:7116']

let push = zmqutil.socket('push')
Promise.map(endpoints, function(endpoint) {
  return srv.resolve(endpoint).then(function(records) {
    return srv.attempt(records, function(record) {
      console.log('Sending output to "%s"', record.url)
      push.connect(record.url)
      return Promise.resolve(true)
    })
  })
}).catch(function(err) {
  console.error('Unable to connect to push endpoint', err)
})


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
      let deploy = require('ios-deploy')
    }, 2000)
  })
})

