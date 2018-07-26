let fs = require('file')

let WDA_SERVER_INSTANCE = null
let MAX_REAL_DEVICE_RESTART_RETRIES = 5

class WDAServer {
  get xcodeBuildCommandLine() {

  }

  get iproxyCommandLine() {

  }

  get unlockKeychainCommandLine() {

  }

  static get instance() {
    if (WDA_SERVER_INSTANCE) {
      WDA_SERVER_INSTANCE = new WDAServer()
    }
    return WDA_SERVER_INSTANCE
  }

  constructor() {
    this.isRealDevice = iOSDevice.isRealDevice
    this.udid = iOSDevice.udid
    this.platformVersion = iOSDevice.platformVersion
    this.ensureToolExistence()
    this.ensureParentDirectoryExistence()
  }

  restart() {
    if (this.isRealDevice && this.failedRestartRetriesCount > MAX_REAL_DEVICE_RESTART_RETRIES) {
      let message = `WDA server cannot start on the connected device with UDID ${this.udid} ` +
        `after ${MAX_REAL_DEVICE_RESTART_RETRIES}, please reboot the device and try again`
      throw new Error(message)
    }

    let hostname = 'localhost'
    console.log(`Trying to (re)start WDA server on ${hostname}:${this.port}`)

    try {
      this.createScriptFile()
      this.runScriptFile()
    } catch(error) {
      console.error('WDA Server cannot be started, failed creating script file', error)
      this.deleteScriptFile()
    }
  }

  ensureToolExistence() {

  }

  ensureParentDirectoryExistence() {

  }

  createScriptFile() {
    let contentLines = ['#!/bin/bash']
    contentLines.push(this.unlockKeychainCommandLine)
    contentLines.push(this.iproxyCommandLine)
    contentLines.push(this.xcodeBuildCommandLine)
    fs.writeFileSync('script.sh', contentLines.join('\n'))
  }

  runScriptFile() {

  }

  deleteScriptFile() {

  }
}
