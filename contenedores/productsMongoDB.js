import mongoose from "mongoose";
import { configMongoDB } from "../options/config.js";

export default class ProductsMongo {
  constructor(nombre) {
    this.nombre = nombre;
    this.mongoose = mongoose
      .connect(configMongoDB.cnxStr, configMongoDB.options)
      .catch((err) => {
        console.log(err);
        process.exit(1);
      });

    const productsSchema = new mongoose.Schema({
      title: { type: String, required: true },
      price: { type: Number, required: true },
      thumbnail: { type: String, required: true },
    });

    this.model = mongoose.model(this.nombre, productsSchema);
  }

  async save(object) {
    try {
      const product = await this.model.create(object);

      return product;
    } catch (err) {
      console.log("Error en la creacion del producto", "\n", err);
    }
  }

  async getAll() {
    try {
      const products = await this.model.find({});

      return products;
    } catch (err) {
      console.log("Error en la muestra de productos", "\n", err);
    }
  }
}
