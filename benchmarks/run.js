'use strict'

const autocannon = require('autocannon')
const { execFileSync, fork } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')
const { workloads } = require('./workloads')

const frameworkNames = ['amala', 'koa', 'fastify']
const scenarioNames = Object.keys(workloads)

function positiveNumber (value, name) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive number`)
  }
  return parsed
}

function parseOptions (args) {
  const options = {
    connections: 100,
    duration: 40,
    output: path.join(__dirname, 'results', 'latest.json'),
    pipelining: 10,
    rounds: 1,
    warmup: 40
  }

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]
    if (argument === '--no-output') {
      options.output = undefined
      continue
    }

    const name = argument.slice(2)
    if (!['connections', 'duration', 'output', 'pipelining', 'rounds', 'warmup'].includes(name)) {
      throw new Error(`Unknown benchmark option: ${argument}`)
    }
    const value = args[index + 1]
    if (!value) throw new Error(`${argument} requires a value`)
    index += 1
    options[name] = name === 'output' ? value : positiveNumber(value, argument)
  }

  options.connections = Math.trunc(options.connections)
  options.pipelining = Math.trunc(options.pipelining)
  options.rounds = Math.trunc(options.rounds)
  return options
}

function startServer (framework, scenario) {
  const startedAt = performance.now()
  const child = fork(
    path.join(__dirname, 'servers', `${framework}.js`),
    [scenario],
    { stdio: ['ignore', 'pipe', 'pipe', 'ipc'] }
  )
  let stderr = ''
  child.stderr.on('data', chunk => {
    // Bound captured failure output so a broken server cannot exhaust memory.
    stderr = (stderr + chunk.toString()).slice(-8000)
  })

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      child.kill('SIGTERM')
      reject(new Error(`${framework}/${scenario} did not start within 15 seconds`))
    }, 15000)

    child.once('message', message => {
      if (message?.type !== 'ready') return
      clearTimeout(timeout)
      resolve({
        child,
        port: message.port,
        startupMs: performance.now() - startedAt,
        stderr: () => stderr
      })
    })
    child.once('exit', code => {
      clearTimeout(timeout)
      reject(new Error(
        `${framework}/${scenario} exited before startup (${code})\n${stderr}`
      ))
    })
  })
}

function serverStats (child) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Benchmark server did not report resource usage'))
    }, 5000)
    child.once('message', message => {
      if (message?.type !== 'stats') return
      clearTimeout(timeout)
      resolve(message)
    })
    child.send({ type: 'stats' })
  })
}

async function stopServer (child) {
  if (child.exitCode !== null) return
  const exited = new Promise(resolve => child.once('exit', resolve))
  child.send({ type: 'shutdown' })

  const timeout = setTimeout(() => child.kill('SIGTERM'), 5000)
  await exited
  clearTimeout(timeout)
}

function requestOptions (workload) {
  const options = {
    method: workload.method,
    headers: {}
  }
  if (workload.requestBody) {
    options.headers['content-type'] = 'application/json'
    options.body = JSON.stringify(workload.requestBody)
  }
  return options
}

async function verifyResponse (url, workload) {
  const options = requestOptions(workload)
  const response = await fetch(url, options)
  const body = await response.json()
  if (response.status !== 200) {
    throw new Error(`Preflight returned HTTP ${response.status}: ${JSON.stringify(body)}`)
  }
  if (JSON.stringify(body) !== JSON.stringify(workload.expectedBody)) {
    throw new Error(
      `Preflight response mismatch: expected ${JSON.stringify(workload.expectedBody)}, received ${JSON.stringify(body)}`
    )
  }
}

async function runAutocannon (url, workload, settings, duration) {
  return autocannon({
    url,
    connections: settings.connections,
    duration,
    pipelining: settings.pipelining,
    ...requestOptions(workload)
  })
}

async function measure (framework, scenario, settings, round) {
  const workload = workloads[scenario]
  const { child, port, startupMs, stderr } = await startServer(framework, scenario)
  const url = `http://127.0.0.1:${port}${workload.requestPath}`

  try {
    // Correctness comes before speed: refuse to benchmark non-equivalent output.
    await verifyResponse(url, workload)
    await runAutocannon(url, workload, settings, settings.warmup)
    const result = await runAutocannon(
      url,
      workload,
      settings,
      settings.duration
    )
    const resources = await serverStats(child)

    if (result.errors || result.timeouts || result.non2xx) {
      throw new Error(
        `${framework}/${scenario} produced errors=${result.errors}, timeouts=${result.timeouts}, non2xx=${result.non2xx}`
      )
    }

    return {
      framework,
      scenario,
      round,
      startupMs,
      rssBytesAfterRun: resources.rssBytes,
      requestsPerSecond: result.requests.average,
      latencyMs: {
        average: result.latency.average,
        p50: result.latency.p50,
        p99: result.latency.p99
      },
      throughputBytesPerSecond: result.throughput.average,
      totalRequests: result.requests.total,
      errors: result.errors,
      timeouts: result.timeouts,
      non2xx: result.non2xx
    }
  } catch (error) {
    const serverError = stderr()
    if (serverError) {
      error.message += `\nServer diagnostics:\n${serverError}`
    }
    throw error
  } finally {
    await stopServer(child)
  }
}

function median (values) {
  const sorted = [...values].sort((left, right) => left - right)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2
}

function aggregate (samples) {
  return scenarioNames.flatMap(scenario => frameworkNames.map(framework => {
    const matches = samples.filter(sample => (
      sample.scenario === scenario && sample.framework === framework
    ))
    return {
      framework,
      scenario,
      startupMs: median(matches.map(sample => sample.startupMs)),
      rssBytesAfterRun: median(matches.map(sample => sample.rssBytesAfterRun)),
      requestsPerSecond: median(matches.map(sample => sample.requestsPerSecond)),
      latencyMs: {
        average: median(matches.map(sample => sample.latencyMs.average)),
        p50: median(matches.map(sample => sample.latencyMs.p50)),
        p99: median(matches.map(sample => sample.latencyMs.p99))
      },
      throughputBytesPerSecond: median(
        matches.map(sample => sample.throughputBytesPerSecond)
      )
    }
  }))
}

function packageVersion (packageName) {
  let directory = path.dirname(require.resolve(packageName))
  while (directory !== path.dirname(directory)) {
    const packagePath = path.join(directory, 'package.json')
    if (fs.existsSync(packagePath)) {
      const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
      if (packageData.name === packageName) return packageData.version
    }
    directory = path.dirname(directory)
  }
  throw new Error(`Could not locate package metadata for ${packageName}`)
}

function gitValue (args, fallback) {
  try {
    return execFileSync('git', args, { encoding: 'utf8' }).trim()
  } catch {
    return fallback
  }
}

function environment () {
  const cpus = os.cpus()
  return {
    timestamp: new Date().toISOString(),
    node: process.version,
    platform: `${process.platform} ${process.arch}`,
    cpu: cpus[0]?.model || 'unknown',
    logicalCpus: cpus.length,
    memoryBytes: os.totalmem(),
    gitCommit: gitValue(['rev-parse', 'HEAD'], 'unknown'),
    gitDirty: Boolean(gitValue(['status', '--porcelain'], 'unknown')),
    versions: {
      amala: require('../package.json').version,
      koa: packageVersion('koa'),
      router: packageVersion('@koa/router'),
      fastify: packageVersion('fastify'),
      zod: packageVersion('zod'),
      autocannon: packageVersion('autocannon')
    }
  }
}

function formatNumber (value) {
  return Math.round(value).toLocaleString('en-US')
}

function reportSettings (settings) {
  const { output, ...publicSettings } = settings
  return publicSettings
}

function markdownReport (report) {
  const rows = scenarioNames.map(scenario => {
    const amala = report.results.find(result => (
      result.scenario === scenario && result.framework === 'amala'
    ))
    const koa = report.results.find(result => (
      result.scenario === scenario && result.framework === 'koa'
    ))
    const fastify = report.results.find(result => (
      result.scenario === scenario && result.framework === 'fastify'
    ))
    const versusKoa = (amala.requestsPerSecond / koa.requestsPerSecond) * 100
    const versusFastify = (amala.requestsPerSecond / fastify.requestsPerSecond) * 100
    return `| ${workloads[scenario].label} | ${formatNumber(amala.requestsPerSecond)} | ${formatNumber(koa.requestsPerSecond)} | ${formatNumber(fastify.requestsPerSecond)} | ${versusKoa.toFixed(1)}% | ${versusFastify.toFixed(1)}% |`
  })
  const latencyRows = scenarioNames.map(scenario => {
    const amala = report.results.find(result => (
      result.scenario === scenario && result.framework === 'amala'
    ))
    const koa = report.results.find(result => (
      result.scenario === scenario && result.framework === 'koa'
    ))
    const fastify = report.results.find(result => (
      result.scenario === scenario && result.framework === 'fastify'
    ))
    return `| ${workloads[scenario].label} | ${amala.latencyMs.p99.toFixed(2)} ms | ${koa.latencyMs.p99.toFixed(2)} ms | ${fastify.latencyMs.p99.toFixed(2)} ms |`
  })
  const resourceRows = scenarioNames.map(scenario => {
    const amala = report.results.find(result => (
      result.scenario === scenario && result.framework === 'amala'
    ))
    const koa = report.results.find(result => (
      result.scenario === scenario && result.framework === 'koa'
    ))
    const fastify = report.results.find(result => (
      result.scenario === scenario && result.framework === 'fastify'
    ))
    return `| ${workloads[scenario].label} | ${amala.startupMs.toFixed(1)} ms | ${koa.startupMs.toFixed(1)} ms | ${fastify.startupMs.toFixed(1)} ms | ${(amala.rssBytesAfterRun / 1024 / 1024).toFixed(1)} MiB | ${(koa.rssBytesAfterRun / 1024 / 1024).toFixed(1)} MiB | ${(fastify.rssBytesAfterRun / 1024 / 1024).toFixed(1)} MiB |`
  })

  return `# Amala vs Koa vs Fastify benchmark\n\n` +
    `> Synthetic framework-overhead snapshot generated ${report.environment.timestamp}. ` +
    `Application performance depends on workload and deployment hardware.\n\n` +
    `## Results\n\n` +
    `| Workload | Amala req/s | Koa + Router req/s | Fastify req/s | Amala / Koa | Amala / Fastify |\n` +
    `| --- | ---: | ---: | ---: | ---: | ---: |\n` +
    `${rows.join('\n')}\n\n` +
    `## Tail latency\n\n` +
    `| Workload | Amala p99 | Koa + Router p99 | Fastify p99 |\n` +
    `| --- | ---: | ---: | ---: |\n` +
    `${latencyRows.join('\n')}\n\n` +
    `## Resource profile\n\n` +
    `| Workload | Amala startup | Koa startup | Fastify startup | Amala RSS | Koa RSS | Fastify RSS |\n` +
    `| --- | ---: | ---: | ---: | ---: | ---: | ---: |\n` +
    `${resourceRows.join('\n')}\n\n` +
    `## Environment\n\n` +
    `- Node: ${report.environment.node}\n` +
    `- Platform: ${report.environment.platform}\n` +
    `- CPU: ${report.environment.cpu} (${report.environment.logicalCpus} logical CPUs)\n` +
    `- Memory: ${(report.environment.memoryBytes / 1024 / 1024 / 1024).toFixed(1)} GiB\n` +
    `- Commit: \`${report.environment.gitCommit}\`${report.environment.gitDirty ? ' (dirty working tree)' : ''}\n` +
    `- Versions: Amala ${report.environment.versions.amala}, Koa ${report.environment.versions.koa}, ` +
    `@koa/router ${report.environment.versions.router}, Fastify ${report.environment.versions.fastify}, ` +
    `Zod ${report.environment.versions.zod}, ` +
    `Autocannon ${report.environment.versions.autocannon}\n\n` +
    `## Method\n\n` +
    `Each framework runs in a fresh child process on loopback. Startup includes process launch, dependency loading, and route setup. Before measurement, the runner verifies the exact HTTP status and JSON response, then warms the server for ${report.settings.warmup}s. It measures ${report.settings.duration}s with ${report.settings.connections} connections and HTTP/1.1 pipelining of ${report.settings.pipelining}, across ${report.settings.rounds} round(s). Reported values are medians. Framework order rotates by workload and round. RSS is sampled from the server process immediately after each measured run.\n\n` +
    `The routing workloads disable Amala's body parser, CORS, and OpenAPI middleware. Koa uses @koa/router for matched route behavior. The legacy validation workload gives Koa and Amala the same koa-body, class-transformer, and class-validator path. The Standard Schema workload gives Amala and Koa the same Zod schema and confirms parsed output. Fastify uses equivalent compiled JSON Schema validation and serialization. Post-run RSS reflects each server operating at its own maximum throughput, not memory per request.\n`
}

function printSummary (report) {
  console.log('\n' + markdownReport(report))
}

function writeReport (output, report) {
  const jsonPath = path.resolve(output)
  const markdownPath = jsonPath.replace(/\.json$/i, '.md')
  fs.mkdirSync(path.dirname(jsonPath), { recursive: true })
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2) + '\n')
  fs.writeFileSync(markdownPath, markdownReport(report))
  console.log(`\nWrote ${jsonPath}`)
  console.log(`Wrote ${markdownPath}`)
}

async function main () {
  const settings = parseOptions(process.argv.slice(2))
  const samples = []

  console.log('Amala vs Koa vs Fastify benchmark')
  console.log(JSON.stringify({
    settings: reportSettings(settings),
    environment: environment()
  }, null, 2))

  for (let scenarioIndex = 0; scenarioIndex < scenarioNames.length; scenarioIndex += 1) {
    const scenario = scenarioNames[scenarioIndex]
    for (let round = 1; round <= settings.rounds; round += 1) {
      // Rotate three frameworks so each occupies every run-order position as
      // workloads and additional rounds advance.
      const offset = (scenarioIndex + round - 1) % frameworkNames.length
      const order = [
        ...frameworkNames.slice(offset),
        ...frameworkNames.slice(0, offset)
      ]
      for (const framework of order) {
        process.stdout.write(`Measuring ${scenario}/${framework}, round ${round}... `)
        const sample = await measure(framework, scenario, settings, round)
        samples.push(sample)
        console.log(`${formatNumber(sample.requestsPerSecond)} req/s`)
      }
    }
  }

  const report = {
    environment: environment(),
    settings: reportSettings(settings),
    workloads,
    samples,
    results: aggregate(samples)
  }
  printSummary(report)
  if (settings.output) writeReport(settings.output, report)
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
