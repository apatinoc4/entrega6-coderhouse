import mongoose from "mongoose";
import { configMongoDB } from "../options/config.js";

export default class UsersMongo {
  constructor(nombre) {
    this.nombre = nombre;
    this.mongoose = mongoose
      .connect(configMongoDB.cnxStr, configMongoDB.options)
      .catch((err) => {
        console.log(err);
        process.exit(1);
      });

    const usersSchema = new mongoose.Schema({
      username: { type: String, required: true },
      password: { type: String, required: true },
    });

    this.model = mongoose.model(this.nombre, usersSchema);
  }

  async save(object) {
    try {
      const user = await this.model.create(object);

      return user;
    } catch (err) {
      console.log("Error en la creacion del usuario", "\n", err);
    }
  }

  async getOne(username) {
    try {
      const foundUser = await this.model.findOne({ username: username });

      if (foundUser) {
        return foundUser;
      }

      return null;
    } catch (err) {
      console.log("Error en la busqueda", "\n", err);
    }
  }

  async getAll() {
    try {
      const users = await this.model.find({});

      return users;
    } catch (err) {
      console.log("Error en la muestra de usuarios", "\n", err);
    }
  }
}
