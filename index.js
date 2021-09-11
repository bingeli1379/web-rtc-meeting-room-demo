const express = require('express')
const app = express()
const expressWs = require('express-ws')(app)
app.use(express.static(__dirname + '/views'))

let websocketList = []
app.ws('/connection', ws => {
  const id = new Date().getTime()
  ws.id = id
  ws.send(JSON.stringify({
    event: 'init',
    id,
    userList: websocketList.map(item => item.id)
  }))
  websocketList.push(ws)

  ws.on('message', msg => {
    const data = JSON.parse(msg)

    const taker = websocketList.find(item => item.id === data.taker)
    if (data.event === 'request') {
      taker.send(JSON.stringify({
        event: 'request',
        sender: data.sender,
        connection: data.connection
      }))
    }
    if (data.event === 'response') {
      taker.send(JSON.stringify({
        event: 'response',
        sender: data.sender,
        connection: data.connection
      }))
    }
    if (data.event === 'candidate') {
      taker.send(JSON.stringify({
        event: 'candidate',
        sender: data.sender,
        candidate: data.candidate
      }))
    }
  })
  
  ws.on('close', () => {
    websocketList = websocketList.filter(item => item !== ws)
    websocketList.forEach(client => {
      client.send(JSON.stringify({
        event: 'close',
        sender: ws.id
      }))
    })
  })
})

app.listen(3000)