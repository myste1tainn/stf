const fs = require('fs')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const spawn = require('child_process').spawn
const logger = require('../../../util/logger')

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

class Keychain {
  static get EXECUTABLE_PATH() {
    return '/Library/Keychains/System.keychain'
  }

  static get PASSWORD() {
    return 'helloworld'
  }
}

class WDAServer {
  get xcodeBuildCommandLine() {
    let cmdLines = []
    cmdLines.push(XcodeBuild.EXECUTABLE_PATH + ' clean build test')
    cmdLines.push(`-project ${WDA.PROJECT_PATH}`)
    cmdLines.push(`-scheme ${WDA.SCHEME}`)
    cmdLines.push(`-destination id=${this.udid}`)
    cmdLines.push(`-configuration ${WDA.CONFIGURATION}`)
    cmdLines.push(`WDAPORT=${this.deviceWdaPort}`)
    cmdLines.push(`IPHONEOS_DEPLOYMENT_TARGET=${this.platformVersion}`)
    // cmdLines.push(`> ${XcodeBuild.LOG_PATH} 2>&1 &`)
    return cmdLines.join(' \\\n    ')
  }

  get iproxyCommandLine() {
    // let cmdLines = []
    // cmdLines.push(iProxy.EXECUTABLE_PATH)
    // cmdLines.push(this.runningPort.toString())
    // cmdLines.push(this.deviceWdaPort.toString())
    // cmdLines.push(`> ${iProxy.LOG_PATH} 2>&1 &`)
    // return cmdLines.join(' ')
    return ''
  }

  get unlockKeychainCommandLine() {
    // TODO: Implement the right mechanism to unlock keychain, How do we do this?
    let cmdLines = []
    cmdLines.push(`/usr/bin/security -v list-keychains -s ${Keychain.EXECUTABLE_PATH};`)
    cmdLines.push(`/usr/bin/security -v unlock-keychain -p ${Keychain.PASSWORD} ${Keychain.EXECUTABLE_PATH};`)
    cmdLines.push(`/usr/bin/security set-keychain-settings -t 3600 ${Keychain.EXECUTABLE_PATH};`)
    return cmdLines.join('\n')
  }

  constructor(device) {
    this.isRealDevice = device.isRealDevice
    this.udid = device.udid
    this.platformVersion = device.platformVersion
    this.ensureToolExistence()
    this.ensureParentDirectoryExistence()
    this.runningPort = device.port
    this.deviceWdaPort = device.port
    this.log = logger.createLogger('ios:wda-server:' + device.udid.substr(0, 4) + ':' + device.port)
  }

  async restart() {
    if (this.isRealDevice && this.failedRestartRetriesCount > MAX_REAL_DEVICE_RESTART_RETRIES) {
      let message = `WDA server cannot start on the connected device with UDID ${this.udid} ` +
        `after ${MAX_REAL_DEVICE_RESTART_RETRIES}, please reboot the device and try again`
      throw new Error(message)
    }

    this.log.info(`Trying to (re)start WDA server`)

    await this.createScriptFile()
    const results = await this.runScriptFile()
    await this.deleteScriptFile()
    return results
  }

  ensureToolExistence() {
    // TODO: Implement this properly, normally it would be just npm installs
  }

  ensureParentDirectoryExistence() {
    // TODO: Implement this properly
  }

  async createScriptFile() {
    let contentLines = ['#!/bin/bash']
    // TODO: Enable keychain unlock
    // contentLines.push(this.unlockKeychainCommandLine)
    contentLines.push(this.iproxyCommandLine)
    contentLines.push(this.xcodeBuildCommandLine)
    fs.writeFileSync('script.sh', contentLines.join('\n\n'))
    return await exec('chmod +x ./script.sh')
  }

  async runScriptFile() {
    const scriptShell = spawn('./script.sh')
    let timeout = null
    let once = false
    return new Promise((resolve, reject) => {
      scriptShell.stdout.on('data', data => {
        let string = data.toString()
        if (string.indexOf('Check dependencies') > -1) {
          if (timeout) clearTimeout(timeout)
          timeout = setTimeout(() => {
            this.log.info('Installing WDA...')
            resolve(true)
          }, 20000)
        } else if (string.indexOf('BUILD SUCCEEDED') > -1) {
          this.log.info('WDA built finished')
        } else if (string.indexOf('CLEAN TARGET') > -1) {
          if (!once) {
            this.log.info('Cleaning WDA project...')
            once = true
          }
        }
      })
      scriptShell.stderr.on('data', data => {
        let string = data.toString()
        if (string.indexOf('TEST FAILED') > -1) {
          this.log.error('WDA Installation failed')
        }
      })
    })
  }

  async deleteScriptFile() {
    return exec('rm -rf script.sh')
  }
}

module.exports = WDAServer
