import express from "express";
import handlebars from "express-handlebars";
import { normalize, schema, denormalize } from "normalizr";
import util from "util";
import session from "express-session";
import MongoStore from "connect-mongo";

import MessagesMongo from "./contenedores/messagesMongoDB.js";
import ProductsMongo from "./contenedores/productsMongoDB.js";

import ProductMocks from "./mocks/productMocks.js";

import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

function print(objeto) {
  console.log(util.inspect(objeto, false, 12, true));
}

const advancedOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const productsApi = new ProductsMongo("productos");
const messagesApi = new MessagesMongo("mensajes");

const authorSchema = new schema.Entity("author");
const textSchema = new schema.Entity("text");

const messageSchema = new schema.Entity("message", {
  author: authorSchema,
  text: textSchema,
});

const chatSchema = new schema.Entity(
  "message",
  {
    messages: [messageSchema],
  },
  { idAttribute: () => 123 }
);

app.use(
  session({
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      mongoOptions: advancedOptions,
    }),
    secret: "secreto",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 50000,
    },
  })
);
app.use(express.static("public"));
app.use("/css", express.static(__dirname + "/node_modules/bootstrap/dist/css"));

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

  const normalizedMessages = normalize(messages, chatSchema);

  const originalLength = JSON.stringify(messages).length;
  const normalizedLength = JSON.stringify(normalizedMessages).length;
  const compressedPercentage = (
    (originalLength * 100) /
    normalizedLength
  ).toFixed(2);

  const denormalizedMessages = denormalize(
    normalizedMessages.result,
    chatSchema,
    normalizedMessages.entities
  );

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
  const username = req.session.nombre ? req.session.nombre : "";
  let logged = false;

  if (username) {
    logged = true;
  }

  res.render("createProduct", {
    username,
    logged,
  });
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

app.post("/login", (req, res) => {
  const { username } = req.body;
  req.session.nombre = username;

  res.redirect("/");
});

app.get("/logout", (req, res) => {
  const username = req.session.nombre;

  req.session.destroy((err) => {
    res.render("logoutMessage", {
      layout: "logoutMessageLayout.hbs",
      username,
    });
  });
});

const srv = server.listen(PORT, () => {
  console.log(
    `Servidor Http con Websockets escuchando en el puerto ${srv.address().port}`
  );
});

srv.on("error", (error) => console.log(`Error en servidor ${error}`));
