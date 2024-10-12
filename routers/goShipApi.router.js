const axios = require("axios");
const goShipApiRouter = require("express").Router();

goShipApiRouter.get("/cities", async (req, res) => {
  try {
    const result = await axios({
      url: `http://sandbox.goship.io/api/v2/cities`,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: process.env.GO_SHIP_TOKEN,
      },
    });
    res.status(200).send(result.data);
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
});
goShipApiRouter.get("/cities/:city_id/districts", async (req, res) => {
  const { city_id } = req.params;
  try {
    const result = await axios({
      url: `http://sandbox.goship.io/api/v2/cities/${city_id}/districts`,
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: process.env.GO_SHIP_TOKEN,
      },
    });
    res.status(200).send(result.data);
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
});
goShipApiRouter.get("/districts/:district_id/wards", async (req, res) => {
  const { district_id } = req.params;
  try {
    const result = await axios({
      url: `http://sandbox.goship.io/api/v2/districts/${district_id}/wards`,
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: process.env.GO_SHIP_TOKEN,
      },
    });
    res.status(200).send(result.data);
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
});
goShipApiRouter.post("/rates", async (req, res) => {
  const { to_district, to_city, cod, amount, product_num } = req.body;
  try {
    const result = await axios({
      url: "http://sandbox.goship.io/api/v2/rates",
      method: "POST",
      data: {
        shipment: {
          address_from: {
            district: process.env.GO_SHIP_SHOP_DISTRICT_ID,
            city: process.env.GO_SHIP_SHOP_CITY_ID,
          },
          address_to: {
            district: to_district,
            city: to_city,
          },
          parcel: {
            cod,
            amount,
            width: 30,
            height: 40,
            length: 10 * product_num,
            weight: 300 * product_num,
          },
        },
      },
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: process.env.GO_SHIP_TOKEN,
      },
    });
    res.status(200).send(result.data);
  } catch (error) {
    handleErrorResponse(res, 500, error);
  }
});
module.exports = goShipApiRouter;
