'use strict'

// Keep request and response fixtures in one place so both frameworks perform
// exactly the same user-visible work during every measurement.
const workloads = {
  routing: {
    label: 'Static JSON route',
    routePath: '/hello',
    requestPath: '/hello',
    method: 'GET',
    expectedBody: { hello: 'world' }
  },
  params: {
    label: 'Route parameter',
    routePath: '/orders/:id',
    requestPath: '/orders/order_123',
    method: 'GET',
    expectedBody: { id: 'order_123', status: 'processing' }
  },
  validation: {
    label: 'Validated JSON body',
    routePath: '/orders',
    requestPath: '/orders',
    method: 'POST',
    requestBody: { customerId: 'customer_123', quantity: 2 },
    expectedBody: {
      id: 'order_123',
      customerId: 'customer_123',
      quantity: 2
    }
  }
}

module.exports = { workloads }
