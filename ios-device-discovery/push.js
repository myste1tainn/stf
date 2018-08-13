const zmqutil = require('../lib/util/zmqutil')
const srv = require('../lib/util/srv')
const Promise = require('bluebird')

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

module.exports = push
