const fs = require("fs");

module.exports = class Contenedor {
  constructor(nombre) {
    this.nombre = nombre;
  }

  async save(object) {
    const stringifiedObj = JSON.stringify({ ...object, id: 1 });
    const fileExists = fs.existsSync(`${this.nombre}`);

    if (!fileExists) {
      try {
        await fs.promises.writeFile(`./${this.nombre}`, `[${stringifiedObj}]`);

        return 1;
      } catch (err) {
        console.log("Error en la creacion del archivo!", "\n", err);
      }
    } else {
      try {
        const productArray = await fs.promises.readFile(
          `./${this.nombre}`,
          "utf-8"
        );
        const parsedProductArray = JSON.parse(productArray);

        parsedProductArray.push({
          ...object,
          id:
            parsedProductArray.length === 0
              ? 1
              : parsedProductArray[parsedProductArray.length - 1].id + 1,
        });

        await fs.promises.writeFile(
          `./${this.nombre}`,
          JSON.stringify(parsedProductArray)
        );

        return parsedProductArray.length === 0
          ? 1
          : parsedProductArray[parsedProductArray.length - 1].id;
      } catch (err) {
        console.log("Error en la modificacion del archivo!", "\n", err);
      }
    }
  }

  async getById(id) {
    try {
      const productArray = await fs.promises.readFile(
        `./${this.nombre}`,
        "utf-8"
      );
      const parsedProductArray = JSON.parse(productArray);
      const foundProduct = parsedProductArray.find(
        (product) => product.id === id
      );

      if (foundProduct) {
        return foundProduct;
      }

      return null;
    } catch (err) {
      console.log("Error en la busqueda", "\n", err);
    }
  }

  async getAll() {
    try {
      const productArray = await fs.promises.readFile(
        `./${this.nombre}`,
        "utf-8"
      );
      const parsedProductArray = JSON.parse(productArray);

      return parsedProductArray;
    } catch (err) {
      console.log("Error en la muestra de productos", "\n", err);
    }
  }

  async updateById(id, obj) {
    try {
      const productArray = await fs.promises.readFile(
        `./${this.nombre}`,
        "utf-8"
      );
      const parsedProductArray = JSON.parse(productArray);

      if (parsedProductArray.find((product) => product.id === id)) {
        const parsedProductArrayNoProduct = parsedProductArray.filter(
          (product) => product.id !== id
        );

        const updatedProduct = {
          ...obj,
          id: id,
        };

        parsedProductArrayNoProduct.push(updatedProduct);

        parsedProductArrayNoProduct.sort((a, b) => a.id - b.id);

        await fs.promises.writeFile(
          `./${this.nombre}`,
          JSON.stringify(parsedProductArrayNoProduct)
        );

        return updatedProduct;
      }

      return { error: "producto no encontrado" };
    } catch (err) {
      console.log("Error en la actualizacion de producto", "\n", err);
    }
  }

  async deleteById(id) {
    try {
      const productArray = await fs.promises.readFile(
        `./${this.nombre}`,
        "utf-8"
      );
      const parsedProductArray = JSON.parse(productArray);

      const filteredProductArray = parsedProductArray.filter(
        (product) => product.id !== id
      );

      fs.promises.writeFile(
        `./${this.nombre}`,
        JSON.stringify(filteredProductArray)
      );
    } catch (err) {
      console.log(err);
    }
  }

  async deleteAll() {
    try {
      await fs.promises.writeFile(`./${this.nombre}`, "[]");
    } catch (err) {
      console.log(err);
    }
  }
};
