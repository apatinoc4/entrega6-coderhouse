import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const configMongoDB = {
  cnxStr: process.env.MONGODB_URL,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
  },
};

export { configMySQL, configSQLite, configMongoDB };
