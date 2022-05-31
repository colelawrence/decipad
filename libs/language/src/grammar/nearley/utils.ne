@{%

const _getStart = (tokOrNode) =>
  tokOrNode.offset != null
    ? tokOrNode.offset
    : tokOrNode.start

const _getEnd = (tokOrNode) =>
  tokOrNode.offset != null
    ? tokOrNode.offset + tokOrNode.text.length - 1
    : tokOrNode.end

const noEndToken = Symbol('no end token was passed')
function addLoc(node, start, end = start) {
  node.start = _getStart(start)
  node.end = _getEnd(end)

  if (typeof node.start !== 'number' || typeof node.end !== 'number') {
    throw new Error('Bad start or end at ' + JSON.stringify(node, null, 2) + '\n\n-- given: ' + JSON.stringify({ start, end }, null, 2) + '')
  } else {
    return node
  }
}

function getLocationFromArray(locArray) {
  // Most of the time it's really easy to find
  const shortCircuitStart = locArray[0] && _getStart(locArray[0])
  const shortCircuitEnd = locArray[locArray.length - 1] && _getEnd(locArray[locArray.length - 1])
  if (shortCircuitEnd != null && shortCircuitStart != null) {
    return [shortCircuitStart, shortCircuitEnd]
  }

  let start = null
  let end = null

  const foundToken = (tokOrNode) => {
    if (tokOrNode != null) {
      const newStart = _getStart(tokOrNode)
      const newEnd = _getEnd(tokOrNode)

      if (newStart != null && newEnd != null) {
        if (start == null) {
          start = newStart
        }
        end = newEnd
      }
    }
  }

  ;(function recurse(array) {
    if (array == null) return

    if (Array.isArray(array)) {
      for (const item of array) {
        recurse(item)
      }
    } else {
      foundToken(array)
    }
  })(locArray)

  return [start, end]
}

function addArrayLoc(node, locArray) {
  const [start, end] = getLocationFromArray(locArray)
  node.start = start
  node.end = end
  if (typeof node.start !== 'number' || typeof node.end !== 'number') {
    throw new Error('Bad start or end at ' + JSON.stringify(node, null, 2) + '\n\n-- given: ' + JSON.stringify({ start, end }, null, 2) + '')
  } else {
    return node
  }
}

%}
