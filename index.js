const express = require('express')
const app = express()
const expressWs = require('express-ws')(app)
app.use(express.static(__dirname + '/public'))
app.use('/images', express.static(__dirname + '/images'))
app.use(express.static(__dirname + '/views'))

let websocketList = []
app.ws('/connection', ws => {
  const id = new Date().getTime()
  ws.id = id
  ws.send(JSON.stringify({
    event: 'init',
    id,
    memberList: websocketList.map(item => item.id)
  }))
  websocketList.push(ws)

  ws.on('message', msg => {
    const data = JSON.parse(msg)

    const taker = websocketList.find(item => item.id === data.takerId)
    if (data.event === 'request') {
      taker.send(JSON.stringify({
        event: 'request',
        senderId: data.senderId,
        name: data.name,
        connection: data.connection,
        mediaStreamMetaData: data.mediaStreamMetaData
      }))
    }
    if (data.event === 'response') {
      taker.send(JSON.stringify({
        event: 'response',
        senderId: data.senderId,
        name: data.name,
        connection: data.connection,
        mediaStreamMetaData: data.mediaStreamMetaData
      }))
    }
    if (data.event === 'candidate') {
      taker.send(JSON.stringify({
        event: 'candidate',
        senderId: data.senderId,
        candidate: data.candidate
      }))
    }
  })
  
  ws.on('close', () => {
    websocketList = websocketList.filter(item => item !== ws)
    websocketList.forEach(client => {
      client.send(JSON.stringify({
        event: 'close',
        senderId: ws.id
      }))
    })
  })
})

app.use((req, res, next) => {
  res.redirect(301, '/')
})

app.listen(3000)