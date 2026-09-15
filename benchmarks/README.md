# Amala vs Fastify benchmarks

This suite compares Amala and Fastify through the same HTTP client, Node.js
executable, machine, request data, and expected JSON responses. It measures:

- a minimal static JSON route;
- route-parameter injection; and
- valid JSON parsing, validation, and response serialization.

Each result records throughput, latency, errors, exact dependency versions,
hardware, run settings, and server-process resident memory after the load run.

These are synthetic framework-overhead measurements, not a promise about
application performance. Database calls, network services, authentication,
logging, payload size, and deployment topology can dominate real workloads.

## Run the standard benchmark

Use a quiet machine and the Node.js version supported by the package:

```sh
npm run benchmark
```

The standard profile follows the Fastify benchmark convention: 100
connections, HTTP/1.1 pipelining of 10, a 40-second warm-up, and a 40-second
measurement. It writes machine-readable and human-readable results to
`benchmarks/results/latest.json` and `benchmarks/results/latest.md`.

Run the correctness-oriented smoke profile after changing the harness:

```sh
npm run benchmark:smoke
```

You can override settings directly:

```sh
node benchmarks/run.js \
  --connections 50 \
  --pipelining 1 \
  --warmup 10 \
  --duration 20 \
  --rounds 3
```

Multiple rounds alternate framework order and report the median. Before every
sample, the runner checks the HTTP status and exact JSON response. Any error,
timeout, or non-2xx response fails the run instead of producing a misleading
number.

## Interpret the results

The static and parameter workloads disable Amala's body parser, CORS, and
OpenAPI middleware so they isolate routing and controller dispatch. The
validation workload enables JSON parsing and compares Amala's current
class-validator transformation with Fastify's compiled JSON Schema path.

Fastify is designed around performance and compiled schemas, so it is expected
to lead a synthetic throughput comparison. The useful Amala number is the
measured cost of its ergonomics—and whether changes improve or regress that
cost on the same machine and profile.
