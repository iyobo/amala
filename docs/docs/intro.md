---
sidebar_position: 1
---

![amala2](https://github.com/iyobo/amala/assets/5804246/acc68a52-1110-4e84-84b3-7529b1f0d354)
# Intro


**AmalaJS** is a decorator-based API framework powered by Typescript and KoaJS v2+.
Amala is fast, light, self-documenting and Docker-ready; Perfect for microservices.

- Define your REST API endpoints using ES8 _classes_ and _decorators_.
- Inject arguments into your endpoint handlers, effectively turning your controller endpoints into standalone, testable service endpoints.
- Clean, light and FAST endpoints. Powered by Koa.
- No further magic past decorators. Full access to underlying Koa app.
- Project creator comes with fully configured Docker and Docker-compose settings for quick containerization.
- In-built OpenAPI spec generator and Swagger UI!

This leads to clean, self-documenting API endpoints, which also makes them easier to test.

When **enabled**, you can see your API JSON spec `GET /api/docs` and the Swagger UI at `/api/swagger` by default.

## Supporting Amala

**AmalaJS** is an MIT-licensed open source project with its ongoing development made possible entirely by
community support. If AmalaJS is helping you build
awesome APIs, please consider <a href="https://www.patreon.com/bePatron?u=19661939" data-patreon-widget-type="become-patron-button">Becoming a Patron</a>.

If you would like to contribute in other ways, Pull requests are also welcome!


## Getting started
You may create an Amala project with any of the following:
- `npm init amala-app <project_name>`
- `npm create amala-app <project_name>`
- `yarn create amala-app <project_name>`

Any of those will create a docker-ready project for you to expand upon.
Happy

### Alternatively

You can also just install amala:

`yarn add amala`
or
`npm i amala`

And checkout the next section.

