const express = require("express");
const handlebars = require("express-handlebars");
const classContenedor = require("./classContenedor");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const fs = require("fs");

const file1 = new classContenedor("./productos.txt");

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

const messages = [];

io.on("connection", async (socket) => {
  console.log("Se ha conectado un nuevo usuario");

  socket.emit("messages", messages);
  socket.on("new-message", function (data) {
    messages.push(data);
    io.sockets.emit("messages", messages);
    fs.writeFileSync("messages.txt", JSON.stringify(messages));
  });

  const productArray = await file1.getAll();

  socket.emit("products", productArray);
  socket.on("new-product", async function (newProduct) {
    await file1.save(newProduct);
    const updatedproductArray = await file1.getAll();
    io.sockets.emit("products", updatedproductArray);
  });
});

const PORT = 8080;

app.get("/", (req, res) => {
  res.render("createProduct");
});

app.get("/productos", async (req, res) => {
  const arrayProductos = await file1.getAll();

  if (arrayProductos && arrayProductos.length > 0) {
    res.render("productList", {
      productList: arrayProductos,
      listExists: true,
    });
  } else {
    res.render("noProduct");
  }
});

const srv = server.listen(PORT, () => {
  console.log(
    `Servidor Http con Websockets escuchando en el puerto ${srv.address().port}`
  );
});
srv.on("error", (error) => console.log(`Error en servidor ${error}`));
