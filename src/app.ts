import fastify from 'fastify'
import { transactionsRoutes } from './routes/transactions.routes'
import { usersRoutes } from './routes/users.routes'

import cookie from '@fastify/cookie'

export const app = fastify()

app.register(cookie)

app.register(usersRoutes, {
  prefix: 'users',
})

app.register(transactionsRoutes, {
  prefix: 'transactions',
})
