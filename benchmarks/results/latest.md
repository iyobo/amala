# Amala vs Fastify benchmark

> Synthetic framework-overhead snapshot generated 2026-09-15T13:56:42.051Z. Application performance depends on workload and deployment hardware.

## Results

| Workload | Amala req/s | Fastify req/s | Amala throughput relative to Fastify | Amala p99 | Fastify p99 |
| --- | ---: | ---: | ---: | ---: | ---: |
| Static JSON route | 36,982 | 55,381 | 66.8% | 89.00 ms | 57.00 ms |
| Route parameter | 33,278 | 49,437 | 67.3% | 104.00 ms | 65.00 ms |
| Validated JSON body | 13,340 | 33,745 | 39.5% | 283.00 ms | 143.00 ms |

## Resource profile

| Workload | Amala startup | Fastify startup | Amala RSS | Fastify RSS |
| --- | ---: | ---: | ---: | ---: |
| Static JSON route | 713.2 ms | 372.5 ms | 125.3 MiB | 134.3 MiB |
| Route parameter | 943.1 ms | 311.3 ms | 125.9 MiB | 126.0 MiB |
| Validated JSON body | 1098.9 ms | 475.5 ms | 129.9 MiB | 268.8 MiB |

## Environment

- Node: v24.19.0
- Platform: darwin arm64
- CPU: Apple M1 Max (10 logical CPUs)
- Memory: 32.0 GiB
- Commit: `5fd7afb7eef9dec2baf26a4e9f2f58076feb4818`
- Versions: Amala 13.0.1, Koa 3.2.1, @koa/router 15.7.0, Fastify 5.12.4, Autocannon 8.0.0

## Method

Each framework runs in a fresh child process on loopback. Startup includes process launch, dependency loading, and route setup. Before measurement, the runner verifies the exact HTTP status and JSON response, then warms the server for 40s. It measures 40s with 100 connections and HTTP/1.1 pipelining of 10, across 1 round(s). Reported values are medians. Framework order alternates by workload and round. RSS is sampled from the server process immediately after each measured run.

The routing workloads disable Amala's body parser, CORS, and OpenAPI middleware. The validation workload enables only body parsing and compares Amala's class-validator transformation with Fastify's compiled JSON Schema validation and serialization.
