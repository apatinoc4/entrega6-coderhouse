import mongoose from "mongoose";
import { configMongoDB } from "../options/config.js";

export default class MessagesMongo {
  constructor(nombre) {
    this.nombre = nombre;
    this.mongoose = mongoose
      .connect(configMongoDB.cnxStr, configMongoDB.options)
      .catch((err) => {
        console.log(err);
        process.exit(1);
      });

    const authorSchema = new mongoose.Schema({
      id: { type: String, required: true },
      nombre: { type: String, required: true },
      apellido: { type: String, required: true },
      edad: { type: String, required: true },
      alias: { type: String, required: true },
      avatar: { type: String, required: true },
    });

    const messageSchema = new mongoose.Schema({
      author: authorSchema,
      text: { type: String, required: true },
    });

    this.model = mongoose.model(this.nombre, messageSchema);
  }

  async save(object) {
    try {
      const message = await this.model.create(object);

      return message;
    } catch (err) {
      console.log("Error en la creacion de mensaje", "\n", err);
    }
  }

  async getAll() {
    try {
      const messages = await this.model.find({});

      return messages;
    } catch (err) {
      console.log("Error en la muestra de mensajes", "\n", err);
    }
  }
}
