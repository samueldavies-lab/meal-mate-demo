import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'

const PORT = 5173
const DIST = path.resolve('dist')
const MIME = {
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.html': 'text/html',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.json': 'application/json',
}

http.createServer((req, res) => {
  let filePath = path.join(DIST, req.url === '/' ? 'index.html' : req.url)
  const ext = path.extname(filePath)
  
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      // SPA fallback: serve index.html for all non-file routes
      filePath = path.join(DIST, 'index.html')
    }
    fs.readFile(filePath, (err2, data) => {
      if (err2) {
        res.writeHead(500)
        return res.end('500')
      }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'text/plain' })
      res.end(data)
    })
  })
}).listen(PORT, () => {
  console.log(`\n  🐕 Exact local copy running at:`)
  console.log(`  ─────────────────────────────────`)
  console.log(`  ➜  http://localhost:${PORT}`)
  console.log(`  ➜  Press Ctrl+C to stop\n`)
})
