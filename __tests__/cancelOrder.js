const request = require("supertest");
const app = require("../app");
const { User, Order, OrderDetail } = require("../models");
const PasswordEncryptor = require("../utils/PasswordEncryptor");
require("dotenv").config();

describe("DELETE /api/v1/account/:UserId/order/:OrderId", () => {
  let userId, orderId, authToken;

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

      // Kiểm tra phản hồi đăng nhập
      if (loginResponse.status !== 200) {
        throw new Error("Login failed: " + loginResponse.body.message);
      }

      authToken = loginResponse.body.token; // Lưu token từ phản hồi

      // Kiểm tra token
      if (!authToken) {
        throw new Error("Authentication token is undefined");
      }

      // Tạo đơn hàng để kiểm tra hủy
      const order = await Order.create({
        UserId: userId,  // đảm bảo rằng đơn hàng liên kết với người dùng
        PhoneNumber: "0983860758",
        DeliveryAddress: "phung hung, Thị trấn cái dầu, Huyện Châu Phú, An Giang",
        EstimatedDeliveryTime: 2,
        PaymentMethod: "COD",
        ShippingFee: 47200,
        TotalAmount: 355200,
        VoucherId: null,
      });

      // Tạo chi tiết đơn hàng
      await OrderDetail.create({
        OrderId: order.OrderId,
        ShoppingCartId: "1014245VNZ5G7D",
        ProductVariantId: "063024NdfMu4",
        Quantity: 1,
        UnitPrice: 308000,
      });

      orderId = order.OrderId;
    } catch (error) {
      console.error("Lỗi trong beforeAll:", error);
    }
  });

  afterAll(async () => {
    try {
      // Xóa các chi tiết đơn hàng
      await OrderDetail.destroy({ where: { OrderId: orderId } });

      // Xóa đơn hàng
      await Order.destroy({ where: { OrderId: orderId } });

      // Xóa người dùng
      await User.destroy({ where: { UserId: userId } });
    } catch (error) {
      console.error("Lỗi trong afterAll:", error);
    }
  });

  test("Hủy đơn hàng thành công", async () => {
    const response = await request(app)
      .delete(`/api/v1/account/${userId}/order/${orderId}`)
      .set("x-access-token", authToken);

    console.log("Status:", response.status, response.body);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Cancelled successfully");
  });

  test("Hủy đơn hàng không tồn tại", async () => {
    const response = await request(app)
      .delete(`/api/v1/account/${userId}/order/123456`)
      .set("x-access-token", authToken);

    console.log("Status:", response.status, response.body);
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Order not found");
  });

  test("Hủy đơn hàng khi chưa đăng nhập", async () => {
    const response = await request(app)
      .delete(`/api/v1/account/${userId}/order/${orderId}`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("You are not logged in");
  });
});


// describe("DELETE /api/v1/account/:UserId/order/:OrderId", () => {
//   let userId;
//   let orderId;
//   let authToken;

//   beforeAll(async () => {
//     try {
//       const orders = await Order.findAll({ where: { UserId: userId } });
//       const user = await User.create({
//         UserName: "testuser",
//         Password: PasswordEncryptor.hashPassword(
//           "testpassword",
//           process.env.APP_SECRET_KEY
//         ),
//         FullName: "Test User",
//         Email: "testuser@example.com",
//         Avatar: "avatar.png",
//         SecretKey: "secretkey123",
//         OTP: "123456",
//         UserType: "EMPLOYEE",
//         VerifiedAt: new Date(),
//         DeletedAt: new Date(),
//         BlockedAt: new Date(),
//         CreatedAt: new Date(),
//         LoginAt: new Date(),
//       });
//       userId = user.UserId;

//        // Đăng nhập 
//       const loginResponse = await request(app)
//         .post("/api/v1/auth/login") 
//         .send({
//           UserName: "testuser",
//           Password: "testpassword",
//         });
//       authToken = loginResponse.body.token; 

//     } catch (error) {
//       console.error("Lỗi trong beforeAll:", error);
//     }
//   });

//   afterAll(async () => {
//     try {
//       const orders = await Order.findAll({ where: { UserId: userId } });
//       if (orders.length > 0) {
//         for (const order of orders) {
//           await OrderDetail.destroy({ where: { OrderId: order.OrderId } });
//           await Order.destroy({ where: { OrderId: order.OrderId } });
//         }
//       }
//       if (userId) {
//         await User.destroy({ where: { UserId: userId } });
//       }
//     } catch (error) {
//       console.error("Lỗi trong afterAll:", error);
//     }
//   });
  
//   test("thêm đơn hàng thành công", async () => {
//     const response = await request(app)
//       .post(`/api/v1/account/${userId}/order`)
//       .set("x-access-token", `${authToken}`) 
//       .send({
//         PhoneNumber: "0983860758",
//         DeliveryAddress: "phung hung, Thị trấn cái dầu, Huyện Châu Phú, An Giang",
//         EstimatedDeliveryTime: 2,
//         PaymentMethod: "COD",
//         ShippingFee: 47200,
//         TotalAmount: 355200,
//         VoucherId:null,
//         orderDetails: [
//           {
//             ShoppingCartId: "1014245VNZ5G7D",
//             ProductVariantId: "063024NdfMu4",
//             Quantity: 1,
//             UnitPrice: 308000
//           }
//         ]
//       });
//       console.log("Status:", response.status, response.body);
//       expect(response.status).toBe(201);
//       expect(response.body.message).toBe("Order created successfully");
//   }, 10000);
  
//   test("Hủy đơn hàng thành công", async () => {
//     const response = await request(app)
//       .delete(`/api/v1/account/${userId}/order/${orderId}`)
//       .set("x-access-token", authToken);  
  
//     console.log("Status:", response.status, response.body);
//     expect(response.status).toBe(200); 
//     expect(response.body.message).toBe("Order cancelled successfully"); 
//   });
  
  

//   test("Hủy đơn hàng không tồn tại", async () => {
//     const response = await request(app)
//       .delete(`/api/v1/account/${userId}/order/123456`)
//       .set("x-access-token", `${authToken}`) 
  
//     console.log("Status:", response.status, response.body);
//     expect(response.status).toBe(404); 
//     expect(response.body.message).toBe("Order not found");
//   });
  
//   test("Hủy đơn hàng khi chưa đăng nhập", async () => {
//     const response = await request(app)
//     .delete( `/api/v1/account/${userId}/order/${orderId}`);

//     expect(response.status).toBe(401);
//     expect(response.body.message).toBe("You are not logged in");
//   });

//   test("Đăng nhập thành công", async () => {
//     const response = await request(app)
//       .post(`/api/v1/auth/login`)
//       .send({
//         UserName: "testuser",
//         Password: "testpassword",
//       });

//     expect(response.status).toBe(200);
//     expect(response.body.message).toBe("Successful");
//   });
// });
