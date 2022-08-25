import express from "express";
import handlebars from "express-handlebars";
import { normalize, schema, denormalize } from "normalizr";
import util from "util";

import ClassContenedorDB from "./contenedores/classContenedorDB.js";
import MensajesMongo from "./contenedores/classContenedorMongo.js";
import { configMySQL } from "./options/config.js";

import { ProductMocks } from "./mocks/productMocks.js";

import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

function print(objeto) {
  console.log(util.inspect(objeto, false, 12, true));
}

const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const productsApi = new ClassContenedorDB(
  configMySQL.config,
  configMySQL.table
);
const messagesApi = new MensajesMongo("mensajes");

const authorSchema = new schema.Entity("author");

const messageSchema = new schema.Entity(
  "message",
  {
    author: authorSchema,
  },
  { idAttribute: () => 123 }
);

console.log();

app.use(express.static("public"));

app.engine(
  "hbs",
  handlebars.engine({
    extname: ".hbs",
    defaultLayout: "index.hbs",
    layoutsDir: __dirname + "/views/layouts",
    partialsDir: __dirname + "/views/",
  })
);

app.set("view engine", "hbs");
app.set("views", "./views");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

io.on("connection", async (socket) => {
  console.log("Se ha conectado un nuevo usuario");
  const messages = await messagesApi.getAll();

  const normalizedMessages = normalize(messages, [messageSchema]);

  const originalLength = JSON.stringify(messages).length;
  const normalizedLength = JSON.stringify(normalizedMessages).length;
  const compressedPercentage = (
    (normalizedLength * 100) /
    originalLength
  ).toFixed(2);

  const denormalized = denormalize(
    normalizedMessages.result,
    messageSchema,
    normalizedMessages.entities
  );

  print(denormalized);
  socket.emit("compressed", compressedPercentage);

  socket.emit("messages", messages);
  socket.on("new-message", async function (data) {
    messages.push(data);
    io.sockets.emit("messages", messages);
    await messagesApi.save(data);
  });

  const productArray = await productsApi.getAll();

  socket.emit("products", productArray);
  socket.on("new-product", async function (newProduct) {
    await productsApi.save(newProduct);
    const updatedproductArray = await productsApi.getAll();
    io.sockets.emit("products", updatedproductArray);
  });
});

const PORT = 8080;

app.get("/", (req, res) => {
  res.render("createProduct");
});

app.get("/productos", async (req, res) => {
  const arrayProductos = await productsApi.getAll();

  if (arrayProductos && arrayProductos.length > 0) {
    res.render("productList", {
      productList: arrayProductos,
      listExists: true,
    });
  } else {
    res.render("noProduct");
  }
});

app.get("/api/productos-test", async (req, res) => {
  const productMocker = new ProductMocks(5);
  const arrayProductos = productMocker.createProducts();

  res.render("productList", {
    productList: arrayProductos,
    listExists: true,
  });
});

const srv = server.listen(PORT, () => {
  console.log(
    `Servidor Http con Websockets escuchando en el puerto ${srv.address().port}`
  );
});
srv.on("error", (error) => console.log(`Error en servidor ${error}`));
