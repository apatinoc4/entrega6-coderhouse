import { faker } from "@faker-js/faker";

export default class ProductMocks {
  constructor(amount) {
    this.amount = amount;
  }

  createProducts() {
    const randomProducts = [];

    for (let i = 0; i < this.amount; i++) {
      const randomProduct = {
        id: faker.datatype.uuid(),
        title: faker.vehicle.bicycle(),
        price: faker.datatype.number({ min: 1000, max: 10000 }),
        thumbnail: faker.image.imageUrl(400, 600, "bike", true),
      };
      randomProducts.push(randomProduct);
    }

    return randomProducts;
  }
}
