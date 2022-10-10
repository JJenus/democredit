// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
const Config = {

  development: {
    client: 'mysql',
    connection: {
      database: 'democredit_db',
      user:     'root',
      password: ''
    }
  },

  staging: {
    client: 'mysql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'mysql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};

export default Config;