const request = require("supertest");
const app = require("../app"); // Giả sử bạn có một file app.js để khởi tạo Express app
const { User, Voucher, UserVoucher } = require("../models"); // Import models
const PasswordEncryptor = require("../utils/PasswordEncryptor");
const generateId = require("../utils/generateId");
require("dotenv").config();

describe("POST /api/v1/account/:UserId/voucher-wallet", () => {
  let userId;
  let voucherId;
  let authToken;

  beforeAll(async () => {
    try {
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

      // Mô phỏng người dùng đăng nhập để lấy mã thông báo xác thực
      const loginResponse = await request(app)
        .post("/api/v1/auth/login") // Giả sử đường dẫn đăng nhập là /login
        .send({
          UserName: "testuser",
          Password: "testpassword",
        });
      authToken = loginResponse.body.token; // Giả sử mã thông báo trả về trong loginResponse.body.token

      // Tạo voucher
      const voucher = await Voucher.create({
        DiscountType: "PERCENTAGE",
        DiscountAmount: 5000,
        MaxDiscountAmount: 10000,
        MinOrderAmount: 20000,
        UsageLimit: 10,
        CurrentUsage: 0,
        ExpiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Voucher vẫn còn hạn
        CreatedAt: new Date(),
      });
      voucherId = voucher.VoucherId;
    } catch (error) {
      console.error("Lỗi trong beforeAll:", error);
    }
  });

  afterAll(async () => {
    try {
      // Xóa UserVoucher trước khi xóa người dùng và voucher
      await UserVoucher.destroy({
        where: { UserId: userId, VoucherId: voucherId },
      });

      // Xóa người dùng và voucher sau khi test
      if (userId) {
        await User.destroy({ where: { UserId: userId } });
      }
      if (voucherId) {
        await Voucher.destroy({ where: { VoucherId: voucherId } });
      }
    } catch (error) {
      console.error("Lỗi trong afterAll:", error);
    }
  });

  //
  test("chưa đăng nhập mà thêm voucher", async () => {
    const response = await request(app)
      .post(`/api/v1/account/${userId}/voucher-wallet`)
      .send({ VoucherId: voucherId });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("You are not logged in");
  });



  //
  test("thêm voucher chưa tồn tại", async () => {
    const response = await request(app)
      .post(`/api/v1/account/${userId}/voucher-wallet`)
      .set("x-access-token", `${authToken}`)
      .send({ VoucherId: generateId(12) });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Voucher does not exist");
  });



  //
  // test("nên trả lỗi nếu voucher đã hết hạn", async () => {
  //   // Cập nhật voucher để hết hạn
  //   await Voucher.update(
  //     { ExpiryDate: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Đặt ngày hết hạn trước hiện tại
  //     { where: { VoucherId: voucherId } }
  //   );

  //   const response = await request(app)
  //     .post(`/api/v1/account/${userId}/voucher-wallet`)
  //     .set("x-access-token", `${authToken}`)
  //     .send({ VoucherId: voucherId });

  //   expect(response.status).toBe(400);
  //   expect(response.body.message).toBe("Voucher has expired");
  // });



  //
  // test("thêm voucher cho user thành công", async () => {
  //   const response = await request(app)
  //     .post(`/api/v1/account/${userId}/voucher-wallet`)
  //     .set("x-access-token", `${authToken}`)
  //     .send({ VoucherId: voucherId });

  //   expect(response.status).toBe(201);
  //   expect(response.body.message).toBe("Created successfully");
  // });


  //
  // test("nên trả lỗi nếu người dùng đã có voucher", async () => {
  //   const response = await request(app)
  //     .post(`/api/v1/account/${userId}/voucher-wallet`)
  //     .set("x-access-token", `${authToken}`)
  //     .send({ VoucherId: voucherId });

  //   expect(response.status).toBe(400);
  //   expect(response.body.message).toBe("You already have this voucher");
  // });



  //
  // test("nên trả lỗi nếu giới hạn sử dụng đã đạt", async () => {
  //   await Voucher.update(
  //     { CurrentUsage: 10, UsageLimit: 10 }, // Đạt đến giới hạn sử dụng
  //     { where: { VoucherId: voucherId } }
  //   );

  //   const response = await request(app)
  //     .post(`/api/v1/account/${userId}/voucher-wallet`)
  //     .set("x-access-token", `${authToken}`)
  //     .send({ VoucherId: voucherId });

  //   expect(response.status).toBe(400);
  //   expect(response.body.message).toBe("The usage limit for this voucher has been reached");
  // });

});
