'use strict'

require('reflect-metadata')

const Router = require('@koa/router')
const Koa = require('koa')
const { koaBody } = require('koa-body')
const { plainToInstance } = require('class-transformer')
const { IsInt, IsString, Min, validate } = require('class-validator')
const { workloads } = require('../workloads')
const { z } = require('zod')

class CreateOrderInput {}

// Use the same validation metadata as Amala so this baseline isolates the
// framework's argument injection and controller dispatch rather than swapping
// in a different validation library.
IsString()(CreateOrderInput.prototype, 'customerId')
IsInt()(CreateOrderInput.prototype, 'quantity')
Min(1)(CreateOrderInput.prototype, 'quantity')

const standardOrderSchema = z.object({
  customerId: z.string(),
  quantity: z.coerce.number().int().min(1)
})

async function main () {
  const scenario = process.argv[2]
  const app = new Koa()
  const router = new Router()

  // Mirror Amala's request error boundary for a more useful Koa baseline.
  app.use(async (ctx, next) => {
    try {
      await next()
    } catch (error) {
      // Keep the response generic but preserve diagnostics in the isolated
      // benchmark process so a failed equivalence check is actionable.
      console.error(error)
      ctx.status = 500
      ctx.body = { error: 'Internal Server Error' }
    }
  })

  if (scenario === 'routing') {
    router.get(workloads.routing.routePath, ctx => {
      ctx.body = workloads.routing.expectedBody
    })
  } else if (scenario === 'params') {
    router.get(workloads.params.routePath, ctx => {
      ctx.body = { id: ctx.params.id, status: 'processing' }
    })
  } else if (scenario === 'validation') {
    // Amala uses koa-body before route dispatch, so the direct Koa baseline
    // uses the same parser configuration and class-validator transformation.
    app.use(koaBody({
      multipart: false,
      urlencoded: false,
      text: false
    }))
    router.post(workloads.validation.routePath, async ctx => {
      const input = plainToInstance(CreateOrderInput, ctx.request.body, {
        enableImplicitConversion: true
      })
      const errors = await validate(input)
      if (errors.length > 0) {
        ctx.status = 422
        ctx.body = { error: 'Validation failed' }
        return
      }
      ctx.body = {
        id: 'order_123',
        customerId: input.customerId,
        quantity: input.quantity
      }
    })
  } else if (scenario === 'standardValidation') {
    app.use(koaBody({
      multipart: false,
      urlencoded: false,
      text: false
    }))
    router.post(workloads.standardValidation.routePath, async ctx => {
      // Use the same public contract and Zod schema as Amala; this isolates
      // Amala's argument injection and controller dispatch overhead.
      const result = await standardOrderSchema['~standard'].validate(
        ctx.request.body
      )
      if (result.issues) {
        ctx.status = 422
        ctx.body = { error: 'Validation failed' }
        return
      }
      ctx.body = {
        id: 'order_123',
        customerId: result.value.customerId,
        quantity: result.value.quantity
      }
    })
  } else {
    throw new Error(`Unknown benchmark scenario: ${scenario}`)
  }

  app.use(router.routes())
  app.use(router.allowedMethods())

  const server = app.listen(0, '127.0.0.1', () => {
    const address = server.address()
    if (!address || typeof address === 'string') {
      throw new Error('Koa benchmark server did not receive a TCP port')
    }
    process.send?.({ type: 'ready', port: address.port })
  })

  const close = () => server.close(() => process.exit(0))
  process.on('message', message => {
    if (message?.type === 'shutdown') close()
    if (message?.type === 'stats') {
      process.send?.({
        type: 'stats',
        rssBytes: process.memoryUsage().rss
      })
    }
  })
  process.on('SIGTERM', close)
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
