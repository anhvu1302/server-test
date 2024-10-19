const request = require("supertest");
const app = require("../app"); 
const { User, Order,OrderDetail } = require("../models"); 
const PasswordEncryptor = require("../utils/PasswordEncryptor");
require("dotenv").config();
const Voucher = require('../models/voucher'); 
const generateId = require("../utils/generateId");
describe("POST /api/v1/account/:UserId/order", () => {
  let userId;
  let orderId;
  let authToken;

  beforeAll(async () => {
    try {
      await User.destroy({ where: { UserName: "testuser" } });
      // Tạo người dùng
      const user = await User.create({
        UserName: "testuser",
        Password: PasswordEncryptor.hashPassword(
          "testpassword",
          process.env.APP_SECRET_KEY
        ),
        FullName: "Test User",
        Email: "testuser@example.com",
        Avatar: "avatar.png",
        SecretKey: "secretkey123",
        OTP: "123456",
        UserType: "EMPLOYEE",
        VerifiedAt: new Date(),
        CreatedAt: new Date(),
        LoginAt: new Date(),
      });
      userId = user.UserId;

       // Đăng nhập 
      const loginResponse = await request(app)
        .post("/api/v1/auth/login") 
        .send({
          UserName: "testuser",
          Password: "testpassword",
        });
      authToken = loginResponse.body.token; 

    } catch (error) {
      console.error("Lỗi trong beforeAll:", error);
    }
  });

  afterAll(async () => {
    try {
      const orders = await Order.findAll({
        UserId: userId
      });
      // const orders = await Order.findAll({
      //   where: {
      //     UserId: userId,
      //   },
      // });
      

      for (const order of orders) {
        await OrderDetail.destroy({ where: { OrderId: order.OrderId } });
        await Order.destroy({ where: { OrderId: order.OrderId } });
      }
  
      if (userId) {
        await User.destroy({ where: { UserId: userId } });
      }

      // Xóa người dùng sau khi test
      if (userId) {
        await User.destroy({ where: { UserId: userId } });
      }
    } catch (error) {
      console.error("Lỗi trong afterAll:", error);
    }
  });
  
  test("thêm đơn hàng thành công", async () => {
    const response = await request(app)
      .post(`/api/v1/account/${userId}/order`)
      .set("x-access-token", `${authToken}`) 
      .send({
        PhoneNumber: "0983860756",
        DeliveryAddress: "phung hung, Thị trấn cái dầu, Huyện Châu Phú, An Giang",
        EstimatedDeliveryTime: 2,
        PaymentMethod: "COD",
        ShippingFee: 47200,
        TotalAmount: 355200,
        VoucherId:null,
        orderDetails: [
          {
            ShoppingCartId: "1014245VNZ5G7D",
            ProductVariantId: "063024NdfMu4",
            Quantity: 1,
            UnitPrice: 308000
          }
        ]
      });
      console.log("Status:", response.status, response.body);
      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Order created successfully");
  }, 10000);
  
     
  test("chưa đăng nhập mà thêm đơn hàng phải trả về lỗi 401", async () => {
    const response = await request(app)
      .post(`/api/v1/account/${userId}/order`)
      .send({
        PhoneNumber: "0983860756",
        DeliveryAddress: "20 Phường Hưng, Vĩnh Thạnh, Cần Thơ",
        PaymentMethod: "COD",
        TotalAmount: 123456,
        ShippingFee: 15498,
      });

    expect(response.status).toBe(401); 
  });
  
  test("test đăng nhập đúng", async () => {
    const response = await request(app)
      .post(`/api/v1/auth/login`)
      .send({ 
        UserName: "testuser",
        Password: "testpassword",
       }); 
    expect(response.status).toBe(200); 
    expect(response.body.message).toBe("Successful"); 
  });
  
  test("bỏ trống số điện thoại phải trả về lỗi 400", async () => {
    const response = await request(app)
      .post(`/api/v1/account/${userId}/order`)
      .set("x-access-token", `${authToken}`)
      .send({
        PhoneNumber: "",  // bỏ trống trường số điện thoại
        DeliveryAddress: "20 Phường Hưng, Vĩnh Thạnh, Cần Thơ",
        PaymentMethod: "COD",
        EstimatedDeliveryTime: 2,
        TotalAmount: 123456,
        ShippingFee: 47200,
        VoucherId: null,
        orderDetails: [
          {
            ShoppingCartId: "1014245VNZ5G7D",
            ProductVariantId: "063024NdfMu4",
            Quantity: 1,
            UnitPrice: 308000
          }
        ]
      });
    expect(response.status).toBe(400);  
    expect(response.body.message).toBe("PhoneNumber is required"); 
  });

  test("Số điện thoại không đúng định dạng", async () => {
    const response = await request(app)
      .post(`/api/v1/account/${userId}/order`)
      .set("x-access-token", `${authToken}`)
      .send({
        PhoneNumber: "09862617dd", 
        DeliveryAddress: "20 Phường Hưng, Vĩnh Thạnh, Cần Thơ",
        PaymentMethod: "COD",
        EstimatedDeliveryTime: 2,
        TotalAmount: 123456,
        ShippingFee: 47200,
        VoucherId: null,
        orderDetails: [
          {
            ShoppingCartId: "1014245VNZ5G7D",
            ProductVariantId: "063024NdfMu4",
            Quantity: 1,
            UnitPrice: 308000
          }
        ]
      });
    expect(response.status).toBe(400);  
    expect(response.body.message).toBe("PhoneNumber is invalid"); 
  });

  test("bỏ trống địa chỉ phải trả về lỗi 400", async () => {
    const response = await request(app)
      .post(`/api/v1/account/${userId}/order`)
      .set("x-access-token", `${authToken}`)
      .send({
        PhoneNumber: "0986523145", 
        DeliveryAddress: "",  // bỏ trống trường địa chỉ
        PaymentMethod: "COD",
        EstimatedDeliveryTime: 2,
        TotalAmount: 123456,
        ShippingFee: 47200,
        VoucherId: null,
        orderDetails: [
          {
            ShoppingCartId: "1014245VNZ5G7D",
            ProductVariantId: "063024NdfMu4",
            Quantity: 1,
            UnitPrice: 308000
          }
        ]
      });
    expect(response.status).toBe(400);  
    expect(response.body.message).toBe("DeliveryAddress is required"); 
  });
  test("bỏ trống phương thức vận chuyển phải trả về lỗi 400", async () => {
    const response = await request(app)
      .post(`/api/v1/account/${userId}/order`)
      .set("x-access-token", `${authToken}`)
      .send({
        PhoneNumber: "0986523145", 
        DeliveryAddress: "Lam son, Tân Quy, Hà Nam",  
        PaymentMethod: "", // bỏ trống phương thức vẩn chuyển
        EstimatedDeliveryTime: 2,
        TotalAmount: 123456,
        ShippingFee: 47200,
        VoucherId: null,
        orderDetails: [
          {
            ShoppingCartId: "1014245VNZ5G7D",
            ProductVariantId: "063024NdfMu4",
            Quantity: 1,
            UnitPrice: 308000
          }
        ]
      });
    expect(response.status).toBe(400);  
    expect(response.body.message).toBe("PaymentMethod is required"); 
  });
  
});
