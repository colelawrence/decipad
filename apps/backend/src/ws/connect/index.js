exports.handler = async function ws(event) {
  console.log('ws-connect called with', event)
  return {statusCode: 200}
}