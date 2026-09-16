'use strict'

const {
  Body,
  Controller,
  Get,
  IsInt,
  IsString,
  Min,
  Params,
  Post,
  bootstrapControllers
} = require('../../dist')
const { workloads } = require('../workloads')

class CreateOrderInput {}

// These are the same runtime validation rules an Amala application declares
// with TypeScript property decorators. Applying them directly keeps the
// benchmark executable as plain JavaScript against the built npm artifact.
IsString()(CreateOrderInput.prototype, 'customerId')
IsInt()(CreateOrderInput.prototype, 'quantity')
Min(1)(CreateOrderInput.prototype, 'quantity')

class BenchmarkController {
  hello () {
    return workloads.routing.expectedBody
  }

  order (id) {
    return { id, status: 'processing' }
  }

  createOrder (input) {
    return {
      id: 'order_123',
      customerId: input.customerId,
      quantity: input.quantity
    }
  }
}

function decorateScenario (scenario) {
  const prototype = BenchmarkController.prototype

  if (scenario === 'routing') {
    Get(workloads.routing.routePath)(prototype, 'hello')
  } else if (scenario === 'params') {
    Reflect.defineMetadata('design:paramtypes', [String], prototype, 'order')
    Params('id')(prototype, 'order', 0)
    Get(workloads.params.routePath)(prototype, 'order')
  } else if (scenario === 'validation') {
    Reflect.defineMetadata(
      'design:paramtypes',
      [CreateOrderInput],
      prototype,
      'createOrder'
    )
    Body({ required: true })(prototype, 'createOrder', 0)
    Post(workloads.validation.routePath)(prototype, 'createOrder')
  } else {
    throw new Error(`Unknown benchmark scenario: ${scenario}`)
  }

  // TypeScript applies the class decorator after its member decorators. The
  // same ordering matters here because Amala joins their route metadata.
  Controller('/')(BenchmarkController)
}

async function main () {
  const scenario = process.argv[2]
  decorateScenario(scenario)

  const { app } = await bootstrapControllers({
    controllers: [BenchmarkController],
    disableVersioning: true,
    cors: { enabled: false },
    openAPI: { enabled: false },
    // Parsing is intentionally absent from read-only scenarios. The body
    // validation comparison enables JSON parsing without multipart support.
    bodyParser: scenario === 'validation'
      ? { multipart: false, urlencoded: false, text: false }
      : false
  })

  const server = app.listen(0, '127.0.0.1', () => {
    const address = server.address()
    if (!address || typeof address === 'string') {
      throw new Error('Amala benchmark server did not receive a TCP port')
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
