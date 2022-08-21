import knex from "knex";

export default class ContenedorDb {
  constructor(config, table) {
    this.knex = knex(config);
    this.table = table;
  }

  async save(object) {
    try {
      return await this.knex(this.table).insert(object);
    } catch (err) {
      console.log("Error en la creacion", "\n", err);
    }
  }

  async getById(id) {
    try {
      return await this.knex.select().from(this.table).where("id", id);
    } catch (err) {
      console.log("Error en la busqueda", "\n", err);
    }
  }

  async getAll() {
    try {
      return await this.knex.select().from(this.table);
    } catch (err) {
      console.log("Error en la muestra de productos", "\n", err);
    }
  }

  async updateById(id, obj) {
    try {
      return await this.knex(this.table).where("id", id).update(obj);
    } catch (err) {
      console.log("Error en la actualizacion de producto", "\n", err);
    }
  }

  async deleteById(id) {
    try {
      return await this.knex(this.table).where("id", id).del();
    } catch (err) {
      console.log(err);
    }
  }

  async deleteAll() {
    try {
      return await this.knex(this.table).del();
    } catch (err) {
      console.log(err);
    }
  }
}
