const knex = require("knex");
const { configMySQL, configSQLite } = require("../options/config");

const migrateDB = async () => {
  try {
    const dbClient = knex(configMySQL.config);

    await dbClient.schema.dropTableIfExists(configMySQL.table);
    await dbClient.schema.createTable(configMySQL.table, (table) => {
      table.increments("id").primary();
      table.string("title");
      table.string("price");
      table.string("thumbnail");
    });

    await dbClient.destroy();

    console.log("Tabla creada");
  } catch (err) {
    console.log(err);
  }

  try {
    const dbClient = knex(configSQLite.config);

    await dbClient.schema.dropTableIfExists(configSQLite.table);
    await dbClient.schema.createTable(configSQLite.table, (table) => {
      table.increments("id").primary();
      table.string("email");
      table.string("text");
    });

    await dbClient.destroy();
  } catch (err) {
    console.log(err);
  }
};

migrateDB();
