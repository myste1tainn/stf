let fs = require('fs')
let {exec} = require('child_process')

let WDA_SERVER_INSTANCE = null
let MAX_REAL_DEVICE_RESTART_RETRIES = 5

class XcodeBuild {
  static get EXECUTABLE_PATH() {
    return '/usr/bin/xcodebuild'
  }

  static get LOG_PATH() {
    return '~/Desktop/xcodebuild.log'
  }
}

class WDA {
  static get PROJECT_PATH() {
    return './wda/WebDriverAgent.xcodeproj'
  }

  static get SCHEME() {
    return 'WebDriverAgentRunner'
  }

  static get CONFIGURATION() {
    return 'Debug'
  }
}

class iProxy {
  static get EXECUTABLE_PATH() {
    return '/usr/local/bin/iproxy'
  }

  static get LOG_PATH() {
    return '~/Desktop/iproxy.log'
  }
}

class iOSDevice {
  static get isRealDevice() {
    return true
  }

  static get udid() {
    return '296a0e0b33a5242977b89cd69d0be02ef1cf96f2'
  }

  static get platformVersion() {
    return '11.4'
  }
}

class Keychain {
  static get EXECUTABLE_PATH() {
    return '/Library/Keychains/System.keychain'
  }

  static get PASSWORD() {
    return 'helloworld'
  }
}

class WDAServer {
  get runningPort() {
    return 10000
  }

  get deviceWdaPort() {
    return 8100
  }

  get xcodeBuildCommandLine() {
    let cmdLines = []
    cmdLines.push(XcodeBuild.EXECUTABLE_PATH + ' clean build test')
    cmdLines.push(`-project ${WDA.PROJECT_PATH}`)
    cmdLines.push(`-scheme ${WDA.SCHEME}`)
    cmdLines.push(`-destination id=${this.udid}`)
    cmdLines.push(`-configuration ${WDA.CONFIGURATION}`)
    cmdLines.push(`IPHONEOS_DEPLOYMENT_TARGET=${this.platformVersion}`)
    // cmdLines.push(`> ${XcodeBuild.LOG_PATH} 2>&1 &`)
    return cmdLines.join(' \\\n    ')
  }

  get iproxyCommandLine() {
    let cmdLines = []
    cmdLines.push(iProxy.EXECUTABLE_PATH)
    cmdLines.push(this.runningPort.toString())
    cmdLines.push(this.deviceWdaPort.toString())
    cmdLines.push(`> ${iProxy.LOG_PATH} 2>&1 &`)
    return cmdLines.join(' ')
  }

  get unlockKeychainCommandLine() {
    // TODO: Implement the right mechanism to unlock keychain, How do we do this?
    let cmdLines = []
    cmdLines.push(`/usr/bin/security -v list-keychains -s ${Keychain.EXECUTABLE_PATH};`)
    cmdLines.push(`/usr/bin/security -v unlock-keychain -p ${Keychain.PASSWORD} ${Keychain.EXECUTABLE_PATH};`)
    cmdLines.push(`/usr/bin/security set-keychain-settings -t 3600 ${Keychain.EXECUTABLE_PATH};`)
    return cmdLines.join('\n')
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

  async restart() {
    if (this.isRealDevice && this.failedRestartRetriesCount > MAX_REAL_DEVICE_RESTART_RETRIES) {
      let message = `WDA server cannot start on the connected device with UDID ${this.udid} ` +
        `after ${MAX_REAL_DEVICE_RESTART_RETRIES}, please reboot the device and try again`
      throw new Error(message)
    }

    let hostname = 'localhost'
    console.log(`Trying to (re)start WDA server on ${hostname}:${this.runningPort}`)

    try {
      await this.createScriptFile()
      await this.runScriptFile()
      // TODO: Upon this line, means the the script is successfully ran, status should be sent to STF to let it know that device is ready for test.
    } catch (error) {
      console.error('WDA Server cannot be started, failed creating script file', error)
    } finally {
      await this.deleteScriptFile()
    }
  }

  ensureToolExistence() {
    // TODO: Implement this properly, normally it would be just npm installs
  }

  ensureParentDirectoryExistence() {
    // TODO: Implement this properly
  }

  async createScriptFile() {
    let contentLines = ['#!/bin/bash']
    // TODO: Enable keycahin unlock
    // contentLines.push(this.unlockKeychainCommandLine)
    contentLines.push(this.iproxyCommandLine)
    contentLines.push(`USE_PORT=${this.runningPort}`)
    contentLines.push(this.xcodeBuildCommandLine)
    fs.writeFileSync('script.sh', contentLines.join('\n\n'))
    return await exec('chmod +x ./script.sh')
  }

  runScriptFile() {
    exec('./script.sh', {maxBuffer: 1024 * 1024 * 500}, (error, stdout, stderror) => {
      if (error) {
        console.log(error)
      } else if (stdout) {
        console.log('Program result', stdout)
      } else if (stderror) {
        console.log('Program error', stderror)
      } else {
        console.log('Script file run')
      }
    })
  }

  async deleteScriptFile() {
    exec('rm -rf script.sh', (error, stdout, stderror) => {
      if (error) {
        console.log(error)
      } else if (stdout) {
        console.log('Program result', stdout)
      } else if (stderror) {
        console.log('Program error', stderror)
      } else {
        console.log('Script file deleted')
      }
    })
  }
}

module.exports = new WDAServer()
