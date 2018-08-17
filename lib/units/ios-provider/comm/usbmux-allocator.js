const USBMultiplexer = require('./usbmux')

class USBMultiplexerAllocator {
  constructor() {
    this.muxes = []
  }

  /**
   * Create new mux or return an existing one
   - Returns: USBMultiplexer
   */
  mux(wdaPort, sourcePort) {
    let mux = this.muxes.filter(o => o.sourcePort === sourcePort)
    if (!mux) {
      mux = new USBMultiplexer(wdaPort, sourcePort)
      this.muxes.push(mux)
    }
    return mux
  }
}

module.exports = new USBMultiplexerAllocator()
