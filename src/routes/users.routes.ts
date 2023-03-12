import { knex } from '../database'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    try {
      const createUserSchema = z
        .object({
          fullname: z.string(),
          email: z.string(),
          password: z.string().min(8),
          confirmedPassword: z.string().min(8),
          phone: z.string(),
          photo: z.string().nullable(),
        })
        .superRefine(({ password, confirmedPassword }, ctx) => {
          if (confirmedPassword !== password) {
            return ctx.addIssue({
              code: 'custom',
              message: 'Passwords is not match',
            })
          }
        })

      const { fullname, email, password, phone, photo } =
        createUserSchema.parse(request.body)

      await knex('users').insert({
        id: randomUUID(),
        fullname,
        email,
        phone,
        photo,
        password: bcrypt.hashSync(password, 10),
      })

      return reply.status(200).send('Usuário cadastrado com sucesso!')
    } catch (error) {
      return reply.status(500).send({
        message: `${error}`,
      })
    }
  })

  app.get('/', async (request, reply) => {
    try {
      const users = await knex('users').select()
      return reply.status(200).send(users)
    } catch (error) {
      return reply.status(500).send({
        message: `${error}`,
      })
    }
  })

  app.delete('/:id', async (request, reply) => {
    try {
      const deleteUserParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = deleteUserParamsSchema.parse(request.params)

      await knex('users').delete().where('id', id)

      return reply.status(200).send('Usuário deletado com sucesso!')
    } catch (error) {
      return reply.status(500).send({
        message: `${error}`,
      })
    }
  })

  app.get('/:id', async (request, reply) => {
    try {
      const getUserParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getUserParamsSchema.parse(request.params)

      const user = await knex('users').select().where('id', id).first()

      return reply.status(200).send(user)
    } catch (error) {
      return reply.status(500).send({
        message: `${error}`,
      })
    }
  })
}
