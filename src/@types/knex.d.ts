/* eslint-disable no-unused-vars */
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      fullname: string
      email: string
      password: string
      phone: string
      photo?: string | null
      created_at: string
      updated_at: string
    }

    transactions: {
      id: string
      title: string
      amount: number
      type: string
      session_id?: string
      created_at: string
      updated_at: string
    }
  }
}
