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

const WDAServer = require('./wda-server/wda-server')


let devices = {}
let mux = require('usbmux')
let base = 10000
let current = base
new mux.Relay(base, base)
  .on('attached', udid => {
    console.log('udid %s', udid)
    current++
    let key = 'd' + current
    devices[key] = {}
    let wdaServer = new WDAServer({
      udid: udid,
      port: current,
      isRealDevice: true,
      platformVersion: '11.4'
    })
    devices[key].wda = wdaServer
  })
  .on('connect', udid => {
  })

setTimeout(() => {
  devices['d10001'].wda.restart().then(() => {
    devices['d10001'].mux = new mux.Relay(10001, 10001, {
      udid: devices['d10001'].wda.udid
    })
      .on('attached', udid => {
        console.log('%s:UDID %s', 'd10001', udid)
        devices['d10001'].udid = udid
      })
      .on('connect', () => { console.log('%s:connected', 'd10001', devices['d10001'].udid) })

    devices['d10002'].wda.restart().then(() => {
      devices['d10002'].mux = new mux.Relay(10002, 10002, {
        udid: devices['d10002'].wda.udid
      })
        .on('attached', udid => {
          console.log('%s:UDID %s', 'd10002', udid)
          devices['d10002'].udid = udid
        })
        .on('connect', () => { console.log('%s:connected', 'd10002', devices['d10002'].udid) })
    })
  })
}, 1000)

