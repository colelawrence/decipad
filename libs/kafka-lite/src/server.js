'use strict'

const Server = require('net').Server
const path = require('path')
const assert = require('assert')
const createLog = require('./log')
const createConnHandler = require('./conn-handler')
const createGroupManager = require('./group-manager')

const defaultOptions = {
  dataDir: path.join(process.cwd(), '.kafka_lite_data'),
  maxSegmentSizeBytes: 1024 ** 3 // 1GB
}

async function kafkalite (options = {}) {
  const server = new Server()

  const conf = Object.assign({}, defaultOptions, options)
  verifyConf(conf)
  const log = await createLog(conf)
  const groupManager = await createGroupManager(log, conf)
  const connHandler = createConnHandler(log, conf, groupManager)

  const closeServer = server.close.bind(server)
  server.close = () => {
    log.close()
    closeServer()
  }

  server.on('connection', connHandler)

  server.once('listening', () => {
    const { port, address } = server.address()
    conf.port = port
    conf.host = address
    console.log('kafka-lite server listening on ', { port, address })
  })

  return server
}

function verifyConf (conf) {
  assert((typeof conf.nodeId) === 'number', 'conf.nodeId must be a number')
  assert(Math.abs(conf.nodeId) === conf.nodeId, 'conf.nodeId must be an integer number')
}

module.exports = kafkalite
