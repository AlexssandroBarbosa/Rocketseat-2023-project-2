import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table
      .timestamp('created_at')
      .defaultTo(knex.fn.now())
      .notNullable()
      .after('photo')
    table
      .timestamp('updated_at')
      .defaultTo(knex.fn.now())
      .notNullable()
      .after('created_at')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('created_at')
    table.dropColumn('updated_at')
  })
}
