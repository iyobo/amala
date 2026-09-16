'use strict'

const Fastify = require('fastify')
const { workloads } = require('../workloads')

async function main () {
  const scenario = process.argv[2]
  const app = Fastify({ logger: false })

  if (scenario === 'routing') {
    app.get(workloads.routing.routePath, () => workloads.routing.expectedBody)
  } else if (scenario === 'params') {
    app.get(workloads.params.routePath, request => ({
      id: request.params.id,
      status: 'processing'
    }))
  } else if (scenario === 'validation') {
    app.post(workloads.validation.routePath, {
      schema: {
        body: {
          type: 'object',
          additionalProperties: false,
          required: ['customerId', 'quantity'],
          properties: {
            customerId: { type: 'string' },
            quantity: { type: 'integer', minimum: 1 }
          }
        },
        // Fastify commonly compiles response schemas as well as input schemas.
        // This keeps the scenario representative while returning the same JSON.
        response: {
          200: {
            type: 'object',
            required: ['id', 'customerId', 'quantity'],
            properties: {
              id: { type: 'string' },
              customerId: { type: 'string' },
              quantity: { type: 'integer' }
            }
          }
        }
      }
    }, request => ({
      id: 'order_123',
      customerId: request.body.customerId,
      quantity: request.body.quantity
    }))
  } else if (scenario === 'standardValidation') {
    // Fastify's native compiled schema is the equivalent production path; its
    // integer coercion produces the same controller-visible value as Zod.
    app.post(workloads.standardValidation.routePath, {
      schema: {
        body: {
          type: 'object',
          additionalProperties: false,
          required: ['customerId', 'quantity'],
          properties: {
            customerId: { type: 'string' },
            quantity: { type: 'integer', minimum: 1 }
          }
        },
        response: {
          200: {
            type: 'object',
            required: ['id', 'customerId', 'quantity'],
            properties: {
              id: { type: 'string' },
              customerId: { type: 'string' },
              quantity: { type: 'integer' }
            }
          }
        }
      }
    }, request => ({
      id: 'order_123',
      customerId: request.body.customerId,
      quantity: request.body.quantity
    }))
  } else {
    throw new Error(`Unknown benchmark scenario: ${scenario}`)
  }

  await app.listen({ port: 0, host: '127.0.0.1' })
  const address = app.server.address()
  if (!address || typeof address === 'string') {
    throw new Error('Fastify benchmark server did not receive a TCP port')
  }
  process.send?.({ type: 'ready', port: address.port })

  const close = async () => {
    await app.close()
    process.exit(0)
  }
  process.on('message', message => {
    if (message?.type === 'shutdown') {
      close().catch(error => {
        console.error(error)
        process.exit(1)
      })
    }
    if (message?.type === 'stats') {
      process.send?.({
        type: 'stats',
        rssBytes: process.memoryUsage().rss
      })
    }
  })
  process.on('SIGTERM', () => {
    close().catch(error => {
      console.error(error)
      process.exit(1)
    })
  })
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
