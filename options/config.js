const path = require("path");
const dbPath = path.resolve(__dirname, "../DB/messages.sqlite");

const configMySQL = {
  config: {
    client: "mysql",
    connection: {
      host: "127.0.0.1",
      user: "root",
      port: 3306,
      password: "",
      database: "products",
    },
  },
  table: "products",
};

const configSQLite = {
  config: {
    client: "sqlite3",
    connection: {
      filename: dbPath,
    },
    useNullAsDefault: true,
  },
  table: "messages",
};

module.exports = { configMySQL, configSQLite };
