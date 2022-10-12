// Update with your config settings.
// Heroku ClearDB: mysql://b85b8270f0e8ed:97dd8d44@us-cdbr-east-06.cleardb.net/heroku_62e0eec5c956e98?reconnect=true
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
      host: 'us-cdbr-east-06.cleardb.net',
      database: 'heroku_62e0eec5c956e98',
      user:     'b85b8270f0e8ed',
      password: '97dd8d44'
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