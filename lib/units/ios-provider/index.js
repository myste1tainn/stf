// const iosDevice = require('node-ios-device')
// const wireutil = require('../lib/wire/util')
// const wire = require('../lib/wire')
// const solo = wireutil.makePrivateChannel()
// const push = require('./push')
//
// iosDevice.trackDevices().on('devices', function(devices) {
//   devices.forEach(device => {
//     push.send([
//       wireutil.global,
//       wireutil.envelope(new wire.DeviceIntroductionMessage(
//         device.udid,
//         wireutil.toDeviceStatus('device'),
//         new wire.ProviderMessage(
//           solo,
//           'Mysteltain.local'
//         )
//       ))
//     ])
//
//     setTimeout(function() {
//       push.send([
//         wireutil.global,
//         wireutil.envelope(new wire.DeviceReadyMessage(
//           device.udid,
//           wireutil.global
//           )
//         )
//       ])
//     }, 1000)
//
//
//     setTimeout(function() {
//     }, 2000)
//   })
// })
//
// const deviceHeartbeat = require('./device-heartbeat')
// const wdaServer = require('./wda-server')
// wdaServer
//   .restart()
//   .then(() => {
//     console.log('Monitoring heartbeats...')
//     deviceHeartbeat.run()
//   })
//   .catch(e => console.log('WDA server boot-up failed', e))

// ARNON: 16/08/2018 findings
// Turns out solution with debugserver doesn't work since it requires one to
// transform debugserver binary to iPhone, which requires ssh, which requires Jailbreak.
//
// The usbmux is the latest lib found to be usable in terms of listing out devices reactively
// it can also be run from within nodejs system, the documentation is more clear.
//
// Both iproxy and usbmux allow port forwarding to device which is exposed & listening by
// the running of WebDriverAgent giving API-control over device
//
// While the mentioned is ok, the scenario not fits that we want to exposed IP:PORT rather than
// UDID to Appium to have control over the connection e.g. authenticated device control and testing
//
// The last idea came up is to use "usbmux" to control the authentication separately like so:
// 1. Appium knows and connect to a device by UDID
// 2. Appium needs to know the webDriverAgentUrl (which we owns)
// 3. Appium connects to that webDriverAgent
// 4. usbmux receives the connect before forwarding
// 5. We authenticate the connection by taking token / ssh key and so on.
// 6. We decide whether to allow the connection to go through (not sure if possible from within usbmux call block)
// 7. Remote automation test farms enabled for iOS!
//
// But there's one problem in this solution:
// The device won't be listed in Xcode runnable device

const usbmux = require('usbmux')
const logger = require('../lib/util/logger')
const log = logger.createLogger('ios:device')
const relay = new usbmux.Relay(8100, 10001)
  .on('error', function(err) {
    log.error('Relay error %s', err)
  })
  .on('detached', function(udid) {
    log.info('detached %s', udid)
  })
  .on('attached', function(udid) {
    log.info('attached %s', udid)
  })
  .on('connect', function(udid) {
    log.info('connect %s', udid)
  })
  .on('disconnected', function(udid) {
    log.info('disconnectd %s', udid)
  })
  .on('ready', function(udid) {
    log.info('ready %s', udid)
  })
  .on('close', function(udid) {
    log.info('close %s', udid)
  })

// you can stop the relay when done
// relay.stop();

