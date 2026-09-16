# Amala vs Koa vs Fastify benchmarks

This suite compares Amala, a matched Koa stack, and Fastify through the same
HTTP client, Node.js executable, machine, request data, and expected JSON
responses. It measures:

- a minimal static JSON route;
- route-parameter injection; and
- valid JSON parsing, `class-validator` validation, and response serialization;
  and
- validator-neutral Standard Schema validation using the same Zod schema in
  Amala and the matched Koa baseline.

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

The standard profile follows the
[Fastify benchmark convention](https://github.com/fastify/benchmarks): 100
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
OpenAPI middleware so they isolate routing and controller dispatch. Koa uses
`@koa/router` for the same route semantics. The legacy validation workload
gives Koa and Amala the same `koa-body`, `class-transformer`, and
`class-validator` path. The Standard Schema workload gives both the exact same
Zod schema and verifies parsed output before measurement. Fastify uses its
equivalent native compiled JSON Schema path in both validation comparisons.

Fastify is designed around performance and compiled schemas, so it is expected
to lead a synthetic throughput comparison. The useful Amala number is the
measured cost of its ergonomics—and whether changes improve or regress that
cost on the same machine and profile.

Post-run RSS reflects each server operating at its own maximum throughput. It
must not be interpreted as memory per request.

## Dependency safety

Autocannon 8 currently reaches `uuid` through `hyperid`. The root package
override selects a patched `uuid` 11 release; the benchmark smoke run exercises
that dependency path in CI. Both the complete and production-only npm audits
must remain clean.
