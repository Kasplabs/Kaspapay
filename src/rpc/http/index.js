const http = require('http')
const fs = require('fs')
const { EventEmitter } = require('events')

module.exports = class Server extends EventEmitter {
  constructor (port) {
    super()
    
    this.endpoints = new Map()

    for (const file of fs.readdirSync('./src/rpc/http/endpoints').filter(file => file.endsWith('.js'))) {
      const endpoint = require(`./endpoints/${file}`)
      this.endpoints.set(file.replace('.js', ''), endpoint)
    }

    this.server = http.createServer((req, res) => this._handleRequest(req, res))
    this.server.listen(port)
  }

  async _handleRequest (req, res) {
    const parsedUrl = new URL(`https://gatek.kaffinp.xyz${req.url}`)
  
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      'version': 'v1.0'
    })
  
    if (!this.endpoints.has(parsedUrl.pathname.split('/')[1]?.toLowerCase())) return res.end('Endpoint not found.')
  
    const params = Object.fromEntries(parsedUrl.searchParams)
    
    const data = await this.endpoints.get(parsedUrl.pathname.split('/')[1]).run({
      params
    })
    console.log('heeee')
    res.end(JSON.stringify(data))  
  }
}