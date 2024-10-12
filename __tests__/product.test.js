const request = require('supertest');
const app = require('../app'); // Đường dẫn đến file app.js của bạn
const { sequelize } = require('../models');

describe('GET /api/v1/product/active', () => {
  beforeAll(async () => {
    await sequelize.authenticate();
  });

  afterAll(async () => {
    await sequelize.close(); // Đóng kết nối cơ sở dữ liệu sau khi test xong
  });

  it('should return a list of products', async () => {
    const response = await request(app)
      .get('/api/v1/product/active')
      .expect(200);

    expect(response.body).toHaveProperty('message', 'Ok');
    expect(response.body).toHaveProperty('productList');
    expect(Array.isArray(response.body.productList)).toBe(true);
  });
});
