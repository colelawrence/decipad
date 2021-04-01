'use strict'

const path = require('path')
const { mkdir, readdir, stat, appendFile, open } = require('fs/promises')
const assert = require('assert')
const leftpad = require('leftpad')
const Encoder = require('kafkajs/src/protocol/encoder')
const Decoder = require('kafkajs/src/protocol/decoder')
const createFnQueue = require('./utils/fn-queue')
const errorCodes = require('./error-codes')

async function createLogTopicPartitionActor (conf, topic, partition) {
  const segmentOffsetStarts = []
  const q = createFnQueue()
  const partitionDir = path.join(conf.dataDir, `${topic}_${partition}`)
  let headSegment

  function init () {
    return q.push(async () => {
      await mkdir(partitionDir, {
        recursive: true,
        mode: 0o700
      })
      await indexPartitionSegments()
    })
  }

  async function indexPartitionSegments () {
    const foundIndexFiles = new Map()
    const foundLogFiles = new Map()

    const fileNames = await readdir(partitionDir)
    for (const fileName of fileNames) {
      const nameParts = fileName.split('.')
      assert(
        (nameParts.length === 2) && ((nameParts[1] === 'index') || (nameParts[1] === 'log')),
        `unrecognized log file name ${fileName} in ${partitionDir}`)
      const start = parseInt(nameParts[0])
      const type = nameParts[1]
      if (type === 'index') {
        foundIndexFiles.set(start, true)
        if (foundLogFiles.has(start)) {
          segmentOffsetStarts.push(start)
        }
      } else if (type === 'log') {
        foundLogFiles.set(start, true)
        if (foundIndexFiles.has(start)) {
          segmentOffsetStarts.push(start)
        }
      }
    }
    segmentOffsetStarts.sort()

    if (segmentOffsetStarts.length) {
      const lastFileOffset = segmentOffsetStarts[segmentOffsetStarts.length - 1]

      const headFilenamePrefix = fileNamePrefixForOffset(lastFileOffset)
      const logFilePath = `${headFilenamePrefix}.log`
      const indexFilePath = `${headFilenamePrefix}.index`
      const headLogStat = await stat(logFilePath)
      const headIndexStat = await stat(indexFilePath)
      const startOffset = lastFileOffset
      headSegment = {
        size: BigInt(headLogStat.size),
        startOffset,
        nextOffset: BigInt(startOffset + headIndexStat.size / 16),
        log: logFilePath,
        index: indexFilePath
      }
    } else {
      const filenamePrefix = fileNamePrefixForOffset(0)
      headSegment = {
        size: 0n,
        startOffset: 0n,
        nextOffset: 0n,
        log: `${filenamePrefix}.log`,
        index: `${filenamePrefix}.index`
      }
      segmentOffsetStarts.push(0)
    }
  }

  function save (decodedRecordBatch, encodedRecordBatch) {
    return q.push(async () => {
      const headSegment = await headSegmentForAppend()
      const firstOffset = headSegment.nextOffset
      let logOffset = headSegment.size

      let offset = firstOffset
      for (const record of decodedRecordBatch.records) {
        const messageEncoder = new Encoder()
        messageEncoder.writeInt64(offset)
        messageEncoder.writeInt64(record.timestamp)
        messageEncoder.writeVarIntBytes(record.key)
        messageEncoder.writeVarIntBytes(record.value)
        const messageBuffer = messageEncoder.buffer
        const messageBufferWithLength = new Encoder(messageBuffer.length + 4)
        messageBufferWithLength.writeInt32(messageBuffer.length)
        messageBufferWithLength.writeEncoder(messageEncoder)
        const messageBufferWithLengthBuffer = messageBufferWithLength.buffer
        await appendFile(headSegment.log, messageBufferWithLengthBuffer)

        const logEncoder = new Encoder(16)
        logEncoder.writeInt64(offset)
        logEncoder.writeInt64(logOffset)
        await appendFile(headSegment.index, logEncoder.buffer)

        offset++
        logOffset += BigInt(messageBufferWithLengthBuffer.length)
        headSegment.size += BigInt(messageBufferWithLengthBuffer.length)
        headSegment.nextOffset++
      }

      const saveReply = {
        partition,
        errorCode: errorCodes.NONE,
        baseOffset: firstOffset,
        logAppendTime: Date.now(),
        logStartOffset: headSegment.startOffset,
        recordErrors: [],
        errorMessage: null
      }

      return saveReply
    })
  }

  async function fetch (offset, maxBytes, maxWaitMs) {
    let firstOffset = 0
    let firstTimestamp = 0
    let lastOffsetDelta = 0n
    let maxTimestamp = 0
    let expectedOffset = offset
    let errorCode = errorCodes.NONE
    const records = []

    const [baseOffset, filePrefix] = findFilePrefixForOffset(offset)

    const indexFileName = `${filePrefix}.index`
    const indexContents = Buffer.alloc(16)
    let bytesRead = 0
    try {
      const indexFileHandle = await open(indexFileName)
      const indexOffset = (offset - BigInt(baseOffset)) * 16n
      const fileOffset = Number(indexOffset)
      bytesRead = (
        (await indexFileHandle.read(indexContents, 0, 16, fileOffset))
        .bytesRead)
      await indexFileHandle.close()
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err
      }
    }

    if (bytesRead === 16) {
      const indexDecoder = new Decoder(indexContents)
      const readOffset = indexDecoder.readInt64()
      assert(readOffset === offset, 'stored offset is different from requested offset')
      const logPos = indexDecoder.readInt64()

      const logFileName = `${filePrefix}.log`
      const logFileHandle = await open(logFileName)
      const logContents = Buffer.alloc(maxBytes)
      const logFilePos = Number(logPos)
      const { bytesRead: logBytesRead } = await logFileHandle.read(logContents, 0, logContents.length, logFilePos)
      await logFileHandle.close()

      let remainder = logContents.slice(0, logBytesRead)
      const requiredBytes = 4

      while (remainder.length >= requiredBytes) {
        const logDecoder = new Decoder(remainder)
        const recordLength = logDecoder.readInt32()
        remainder = logDecoder.readAll()
        if (remainder.length >= recordLength) {
          const messageDecoder = new Decoder(remainder)
          const decodedOffset = messageDecoder.readInt64()
          const timestamp = messageDecoder.readInt64()
          const key = messageDecoder.readVarIntBytes()
          const value = messageDecoder.readVarIntBytes()

          assert(decodedOffset === expectedOffset, `saved offset is ${decodedOffset} but expected ${expectedOffset}`)

          if (!firstOffset) {
            firstOffset = decodedOffset
          }
          if (!firstTimestamp) {
            firstTimestamp = timestamp
          }
          if (maxTimestamp < timestamp) {
            maxTimestamp = timestamp
          }

          const offsetDelta = decodedOffset - firstOffset
          lastOffsetDelta = offsetDelta

          const newRecord = {
            attributes: 0,
            timestampDelta: timestamp - firstTimestamp,
            offsetDelta: Number(offsetDelta),
            key,
            value,
            headers: []
          }

          records.push(newRecord)

          remainder = messageDecoder.readAll()
          expectedOffset++
        }
      }
    }

    return {
      partition,
      errorCode: errorCode,
      highWatermark: headSegment.nextOffset - 1n,
      lastStableOffset: headSegment.nextOffset - 1n,
      logStartOffset: headSegment.startOffset,
      abortedTransactions: [],
      recordBatch: {
        firstOffset,
        partitionLeaderEpoch: 1,
        crc: 0,
        attributes: 0,
        lastOffsetDelta: Number(lastOffsetDelta),
        firstTimestamp,
        maxTimestamp,
        producerId: conf.nodeId,
        producerEpoch: 1,
        firstSequence: 0,
        records
      }
    }
  }

  async function headSegmentForAppend () {
    if (headSegment.size > conf.maxSegmentSizeBytes) {
      const filenamePrefix = fileNamePrefixForOffset(headSegment.nextOffset)
      headSegment = {
        size: 0n,
        startOffset: headSegment.nextOffset,
        nextOffset: headSegment.nextOffset,
        index: `${filenamePrefix}.index`,
        log: `${filenamePrefix}.log`
      }
      segmentOffsetStarts.push(headSegment.startOffset)
    }

    return headSegment
  }

  function fileNamePrefixForOffset (offset) {
    return path.join(partitionDir, leftpad(offset, 20))
  }

  function findFilePrefixForOffset (offset) {
    let previousStart = 0
    for (const segmentStart of segmentOffsetStarts) {
      if (segmentStart > offset) {
        break
      }
      previousStart = segmentStart
    }
    return [previousStart, fileNamePrefixForOffset(previousStart)]
  }

  function committedOffset () {
    return headSegment.nextOffset - 1n
  }

  await init()

  return {
    save,
    fetch,
    committedOffset
  }
}

module.exports = createLogTopicPartitionActor
