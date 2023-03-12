import { knex } from '../database'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { checkSessionIdExists } from '../middleware/check-session_id-exists'

export async function transactionsRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    try {
      const createTranstionBodySchema = z.object({
        title: z.string(),
        amount: z.number(),
        type: z.enum(['debit', 'credit']),
      })

      const { title, amount, type } = createTranstionBodySchema.parse(
        request.body,
      )

      let sessionId = request.cookies.sessionID

      if (!sessionId) {
        sessionId = randomUUID()

        reply.cookie('sessionID', sessionId, {
          path: '/',
          maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        })
      }

      await knex('transactions').insert({
        id: randomUUID(),
        title,
        amount: type === 'credit' ? amount : amount * -1,
        type,
        session_id: sessionId,
      })

      return reply.status(201).send('Transação cadastrada com sucesso!')
    } catch (error) {
      return reply.status(500).send({
        message: `${error}`,
      })
    }
  })

  app.get(
    '/',
    {
      preHandler: checkSessionIdExists,
    },
    async (request, reply) => {
      try {
        const sessionId = request.cookies.sessionID

        const transactions = await knex('transactions')
          .select()
          .where('session_id', sessionId)

        return reply.status(200).send({
          transactions,
        })
      } catch (error) {
        return reply.status(500).send({
          message: `${error}`,
        })
      }
    },
  )

  app.delete(
    '/:id',
    {
      preHandler: checkSessionIdExists,
    },
    async (request, reply) => {
      try {
        const deleteTransactionsParamsBodySchema = z.object({
          id: z.string().uuid(),
        })

        const { id } = deleteTransactionsParamsBodySchema.parse(request.params)

        await knex('transactions').delete().where('id', id)

        return reply.status(200).send('Transação deletada com sucesso!')
      } catch (error) {
        return reply.status(500).send({
          message: `${error}`,
        })
      }
    },
  )

  app.get(
    '/:id',
    {
      preHandler: checkSessionIdExists,
    },
    async (request, reply) => {
      try {
        const sessionId = request.cookies.sessionID

        const getTransactionsParamsBodySchema = z.object({
          id: z.string().uuid(),
        })

        const { id } = getTransactionsParamsBodySchema.parse(request.params)

        const transaction = await knex('transactions')
          .select()
          .where({
            id,
            session_id: sessionId,
          })
          .first()

        return reply.status(200).send({
          transaction,
        })
      } catch (error) {
        return reply.status(500).send({
          message: `${error}`,
        })
      }
    },
  )

  app.get(
    '/summary',
    {
      preHandler: checkSessionIdExists,
    },
    async (request, reply) => {
      try {
        const sessionId = request.cookies.sessionID

        const summary = await knex('transactions')
          .sum('amount', {
            as: 'amount',
          })
          .where('session_id', sessionId)
          .first()

        return reply.status(200).send({
          summary,
        })
      } catch (error) {
        return reply.status(500).send({
          error: `${error}`,
          message: 'Falha ao buscar o histórico de transações',
        })
      }
    },
  )
}
