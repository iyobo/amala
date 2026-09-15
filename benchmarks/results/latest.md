# Amala vs Koa vs Fastify benchmark

> Synthetic framework-overhead snapshot generated 2026-09-15T15:13:09.575Z. Application performance depends on workload and deployment hardware.

## Results

| Workload | Amala req/s | Koa + Router req/s | Fastify req/s | Amala / Koa | Amala / Fastify |
| --- | ---: | ---: | ---: | ---: | ---: |
| Static JSON route | 67,977 | 72,069 | 100,267 | 94.3% | 67.8% |
| Route parameter | 71,856 | 72,889 | 100,394 | 98.6% | 71.6% |
| Validated JSON body | 34,561 | 38,390 | 43,322 | 90.0% | 79.8% |

## Tail latency

| Workload | Amala p99 | Koa + Router p99 | Fastify p99 |
| --- | ---: | ---: | ---: |
| Static JSON route | 28.00 ms | 23.00 ms | 16.00 ms |
| Route parameter | 22.00 ms | 23.00 ms | 16.00 ms |
| Validated JSON body | 54.00 ms | 47.00 ms | 45.00 ms |

## Resource profile

| Workload | Amala startup | Koa startup | Fastify startup | Amala RSS | Koa RSS | Fastify RSS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Static JSON route | 389.7 ms | 396.2 ms | 232.1 ms | 212.4 MiB | 224.2 MiB | 139.2 MiB |
| Route parameter | 366.5 ms | 350.0 ms | 211.1 ms | 214.2 MiB | 214.0 MiB | 138.9 MiB |
| Validated JSON body | 398.2 ms | 333.8 ms | 236.1 ms | 143.7 MiB | 142.3 MiB | 277.0 MiB |

## Environment

- Node: v24.19.0
- Platform: darwin arm64
- CPU: Apple M1 Max (10 logical CPUs)
- Memory: 32.0 GiB
- Commit: `16853d5b43ffa9c1cdbc42f61ac03285d280f335`
- Versions: Amala 13.0.1, Koa 3.2.1, @koa/router 15.7.0, Fastify 5.12.4, Autocannon 8.0.0

## Method

Each framework runs in a fresh child process on loopback. Startup includes process launch, dependency loading, and route setup. Before measurement, the runner verifies the exact HTTP status and JSON response, then warms the server for 40s. It measures 40s with 100 connections and HTTP/1.1 pipelining of 10, across 1 round(s). Reported values are medians. Framework order rotates by workload and round. RSS is sampled from the server process immediately after each measured run.

The routing workloads disable Amala's body parser, CORS, and OpenAPI middleware. Koa uses @koa/router for matched route behavior. The validation workload gives Koa and Amala the same koa-body, class-transformer, and class-validator path; Fastify uses compiled JSON Schema validation and serialization. Post-run RSS reflects each server operating at its own maximum throughput, not memory per request.
