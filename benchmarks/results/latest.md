# Amala vs Koa vs Fastify benchmark

> Synthetic framework-overhead snapshot generated 2026-09-16T04:55:50.016Z. Application performance depends on workload and deployment hardware.

## Results

| Workload | Amala req/s | Koa + Router req/s | Fastify req/s | Amala / Koa | Amala / Fastify |
| --- | ---: | ---: | ---: | ---: | ---: |
| Static JSON route | 68,569 | 63,014 | 87,904 | 108.8% | 78.0% |
| Route parameter | 60,685 | 61,123 | 83,928 | 99.3% | 72.3% |
| Validated JSON body | 27,296 | 29,130 | 34,033 | 93.7% | 80.2% |
| Standard Schema (Zod) body | 33,881 | 39,558 | 30,539 | 85.6% | 110.9% |

## Tail latency

| Workload | Amala p99 | Koa + Router p99 | Fastify p99 |
| --- | ---: | ---: | ---: |
| Static JSON route | 25.00 ms | 31.00 ms | 20.00 ms |
| Route parameter | 29.00 ms | 32.00 ms | 21.00 ms |
| Validated JSON body | 96.00 ms | 74.00 ms | 64.00 ms |
| Standard Schema (Zod) body | 67.00 ms | 45.00 ms | 108.00 ms |

## Resource profile

| Workload | Amala startup | Koa startup | Fastify startup | Amala RSS | Koa RSS | Fastify RSS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Static JSON route | 289.7 ms | 212.8 ms | 201.1 ms | 216.8 MiB | 213.3 MiB | 146.0 MiB |
| Route parameter | 246.3 ms | 203.7 ms | 199.4 ms | 217.4 MiB | 227.9 MiB | 146.2 MiB |
| Validated JSON body | 571.8 ms | 356.3 ms | 223.5 ms | 145.7 MiB | 141.7 MiB | 273.3 MiB |
| Standard Schema (Zod) body | 378.2 ms | 392.5 ms | 250.3 ms | 150.6 MiB | 153.6 MiB | 274.6 MiB |

## Environment

- Node: v24.19.0
- Platform: darwin arm64
- CPU: Apple M1 Max (10 logical CPUs)
- Memory: 32.0 GiB
- Commit: `0d94beaf4968e4d7693032ca255623abe64e744d`
- Versions: Amala 13.1.0, Koa 3.2.1, @koa/router 15.7.0, Fastify 5.12.4, Zod 4.6.5, Autocannon 8.0.0

## Method

Each framework runs in a fresh child process on loopback. Startup includes process launch, dependency loading, and route setup. Before measurement, the runner verifies the exact HTTP status and JSON response, then warms the server for 40s. It measures 40s with 100 connections and HTTP/1.1 pipelining of 10, across 1 round(s). Reported values are medians. Framework order rotates by workload and round. RSS is sampled from the server process immediately after each measured run.

The routing workloads disable Amala's body parser, CORS, and OpenAPI middleware. Koa uses @koa/router for matched route behavior. The legacy validation workload gives Koa and Amala the same koa-body, class-transformer, and class-validator path. The Standard Schema workload gives Amala and Koa the same Zod schema and confirms parsed output. Fastify uses equivalent compiled JSON Schema validation and serialization. Post-run RSS reflects each server operating at its own maximum throughput, not memory per request.
