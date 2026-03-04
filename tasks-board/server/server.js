#!/usr/bin/env node
// Tasks Board v4 — zero-dependency server
// Only uses Node built-ins: http, fs, path, url

import { createServer } from 'http'
import { readFileSync, writeFileSync, readdirSync, existsSync, unlinkSync, mkdirSync, statSync } from 'fs'
import { join, basename, dirname, resolve, extname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const PORT = process.env.PORT || 3456
const TASKS_DIR = process.env.TASKS_DIR || resolve(__dirname, '../../tasks')
const PREFS_FILE = process.env.PREFS_FILE || resolve(__dirname, 'prefs.json')
const CLIENT_DIR = resolve(__dirname, 'public')

// ── Markdown Parsing (no gray-matter needed) ──

function parseCheckboxes(content) {
  const subtasks = []
  for (const line of content.split('\n')) {
    const m = line.match(/^- \[([ xX])\] (.+)$/)
    if (m) subtasks.push({ label: m[2].trim(), done: m[1] !== ' ' })
  }
  return subtasks
}

function parseInlineMeta(content) {
  const meta = {}
  const patterns = [
    ['priority', /\*\*Priority:\*\*\s*(.+)/i],
    ['status', /\*\*Status:\*\*\s*(.+)/i],
    ['created', /\*\*Created:\*\*\s*(.+)/i],
    ['owner', /\*\*Owner:\*\*\s*(.+)/i],
  ]
  for (const [key, regex] of patterns) {
    const m = content.match(regex)
    if (m) meta[key] = m[1].trim().toLowerCase()
  }
  return meta
}

function extractDescription(content) {
  const lines = content.split('\n')
  const desc = []
  let pastTitle = false
  for (const line of lines) {
    if (line.startsWith('# ')) { pastTitle = true; continue }
    if (!pastTitle) continue
    if (/^\*\*(Priority|Status|Created|Owner):\*\*/i.test(line)) break
    if (/^- \[[ xX]\]/.test(line)) break
    desc.push(line)
  }
  return desc.join('\n').trim()
}

function stripFrontmatter(raw) {
  // If file starts with ---, skip the frontmatter block
  if (raw.startsWith('---')) {
    const end = raw.indexOf('---', 3)
    if (end !== -1) return raw.slice(end + 3).trim()
  }
  return raw
}

function parseTaskFile(filePath, epicId) {
  const raw = readFileSync(filePath, 'utf-8')
  const fileName = basename(filePath, '.md')
  const id = `${epicId}/${fileName}`
  const content = stripFrontmatter(raw)
  const inlineMeta = parseInlineMeta(content)

  return {
    id,
    title: content.match(/^# (.+)$/m)?.[1] || fileName,
    description: extractDescription(content),
    epicId,
    priority: inlineMeta.priority || 'medium',
    status: inlineMeta.status || 'todo',
    created: inlineMeta.created || '',
    owner: inlineMeta.owner || '',
    subtasks: parseCheckboxes(content),
    filePath: `${epicId}/${fileName}.md`,
  }
}

function parseEpicDir(epicDir) {
  const epicId = basename(epicDir)
  const descFile = join(epicDir, '_description.md')
  let name = epicId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  let description = ''

  if (existsSync(descFile)) {
    const raw = readFileSync(descFile, 'utf-8')
    const m = raw.match(/^# (.+)$/m)
    if (m) name = m[1]
    description = extractDescription(raw)
  }

  return { id: epicId, name, description }
}

function serializeTask(task) {
  let md = `# ${task.title}\n\n`
  if (task.description) md += `${task.description}\n\n`
  md += `**Priority:** ${task.priority || 'medium'}\n`
  md += `**Status:** ${task.status || 'todo'}\n`
  if (task.created) md += `**Created:** ${task.created}\n`
  if (task.owner) md += `**Owner:** ${task.owner}\n`
  if (task.subtasks?.length) {
    md += '\n'
    for (const s of task.subtasks) md += `- [${s.done ? 'x' : ' '}] ${s.label}\n`
  }
  return md
}

// ── Prefs ──

function readPrefs() {
  try { return JSON.parse(readFileSync(PREFS_FILE, 'utf-8')) }
  catch { return { sortOrder: [], fontSize: 18, theme: 'dark' } }
}

function writePrefs(prefs) {
  mkdirSync(dirname(PREFS_FILE), { recursive: true })
  writeFileSync(PREFS_FILE, JSON.stringify(prefs, null, 2))
}

// ── Routing ──

function readBody(req) {
  return new Promise((resolve) => {
    let data = ''
    req.on('data', chunk => data += chunk)
    req.on('end', () => { try { resolve(JSON.parse(data)) } catch { resolve({}) } })
  })
}

function json(res, code, data) {
  res.writeHead(code, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
  res.end(JSON.stringify(data))
}

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml',
}

function serveStatic(res, filePath) {
  try {
    const data = readFileSync(filePath)
    const ext = extname(filePath)
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
    res.end(data)
  } catch {
    res.writeHead(404)
    res.end('Not found')
  }
}

async function handleRequest(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`)
  const path = url.pathname
  const method = req.method

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    })
    return res.end()
  }

  try {
    // ── API Routes ──

    // GET /api/epics
    if (method === 'GET' && path === '/api/epics') {
      const dirs = readdirSync(TASKS_DIR, { withFileTypes: true })
        .filter(d => d.isDirectory() && !d.name.startsWith('.'))
        .map(d => parseEpicDir(join(TASKS_DIR, d.name)))
      return json(res, 200, dirs)
    }

    // GET /api/tasks
    if (method === 'GET' && path === '/api/tasks') {
      const tasks = []
      const dirs = readdirSync(TASKS_DIR, { withFileTypes: true })
        .filter(d => d.isDirectory() && !d.name.startsWith('.'))
      for (const dir of dirs) {
        const epicDir = join(TASKS_DIR, dir.name)
        const files = readdirSync(epicDir).filter(f => f.endsWith('.md') && f !== '_description.md')
        for (const file of files) tasks.push(parseTaskFile(join(epicDir, file), dir.name))
      }
      // Apply sort order
      const prefs = readPrefs()
      if (prefs.sortOrder?.length) {
        const order = new Map(prefs.sortOrder.map((id, i) => [id, i]))
        tasks.sort((a, b) => (order.get(a.id) ?? 9999) - (order.get(b.id) ?? 9999))
      }
      return json(res, 200, tasks)
    }

    // GET /api/tasks/:epicId/:taskSlug
    const taskGet = path.match(/^\/api\/tasks\/([^/]+)\/([^/]+)$/)
    if (method === 'GET' && taskGet) {
      const filePath = join(TASKS_DIR, taskGet[1], `${taskGet[2]}.md`)
      if (!existsSync(filePath)) return json(res, 404, { error: 'Not found' })
      return json(res, 200, parseTaskFile(filePath, taskGet[1]))
    }

    // PUT /api/tasks/:epicId/:taskSlug (merge with existing)
    const taskPut = path.match(/^\/api\/tasks\/([^/]+)\/([^/]+)$/)
    if (method === 'PUT' && taskPut) {
      const body = await readBody(req)
      const filePath = join(TASKS_DIR, taskPut[1], `${taskPut[2]}.md`)
      if (!existsSync(filePath)) return json(res, 404, { error: 'Not found' })
      const existing = parseTaskFile(filePath, taskPut[1])
      const merged = { ...existing, ...body, subtasks: body.subtasks || existing.subtasks }
      writeFileSync(filePath, serializeTask(merged))
      return json(res, 200, parseTaskFile(filePath, taskPut[1]))
    }

    // POST /api/tasks
    if (method === 'POST' && path === '/api/tasks') {
      const { epicId, slug, ...taskData } = await readBody(req)
      if (!epicId || !slug) return json(res, 400, { error: 'epicId and slug required' })
      const epicDir = join(TASKS_DIR, epicId)
      if (!existsSync(epicDir)) return json(res, 404, { error: `Epic ${epicId} not found` })
      const filePath = join(epicDir, `${slug}.md`)
      if (existsSync(filePath)) return json(res, 409, { error: 'Task already exists' })
      writeFileSync(filePath, serializeTask({ ...taskData, created: taskData.created || new Date().toISOString().split('T')[0] }))
      const prefs = readPrefs()
      const id = `${epicId}/${slug}`
      if (!prefs.sortOrder?.includes(id)) { prefs.sortOrder = [...(prefs.sortOrder || []), id]; writePrefs(prefs) }
      return json(res, 201, parseTaskFile(filePath, epicId))
    }

    // DELETE /api/tasks/:epicId/:taskSlug
    const taskDel = path.match(/^\/api\/tasks\/([^/]+)\/([^/]+)$/)
    if (method === 'DELETE' && taskDel) {
      const filePath = join(TASKS_DIR, taskDel[1], `${taskDel[2]}.md`)
      if (!existsSync(filePath)) return json(res, 404, { error: 'Not found' })
      unlinkSync(filePath)
      const prefs = readPrefs()
      const id = `${taskDel[1]}/${taskDel[2]}`
      prefs.sortOrder = (prefs.sortOrder || []).filter(i => i !== id)
      writePrefs(prefs)
      return json(res, 200, { deleted: id })
    }

    // GET /api/prefs
    if (method === 'GET' && path === '/api/prefs') return json(res, 200, readPrefs())

    // PATCH /api/prefs
    if (method === 'PATCH' && path === '/api/prefs') {
      const body = await readBody(req)
      const updated = { ...readPrefs(), ...body }
      writePrefs(updated)
      return json(res, 200, updated)
    }

    // ── Static files ──
    let staticPath = path === '/' ? '/index.html' : path
    const filePath = join(CLIENT_DIR, staticPath)
    if (existsSync(filePath) && statSync(filePath).isFile()) return serveStatic(res, filePath)

    // Fallback: SPA
    const indexPath = join(CLIENT_DIR, 'index.html')
    if (existsSync(indexPath)) return serveStatic(res, indexPath)

    res.writeHead(404)
    res.end('Not found')

  } catch (err) {
    json(res, 500, { error: err.message })
  }
}

createServer(handleRequest).listen(PORT, () => {
  console.log(`\n  Tasks Board v4 (zero-dep)`)
  console.log(`  ├── http://localhost:${PORT}`)
  console.log(`  ├── Tasks:  ${TASKS_DIR}`)
  console.log(`  └── Prefs:  ${PREFS_FILE}\n`)
})
