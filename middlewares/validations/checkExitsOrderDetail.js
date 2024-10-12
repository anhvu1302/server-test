const { OrderDetail } = require('../../models');

const checkExistOrderDetail = async (req, res, next) => {
  try {
    const { OrderId, ProductVariantId } = req.params;
    const orderDetail = await OrderDetail.findOne({
      where: {
        OrderId,
        ProductVariantId
      },
    });
    if (!orderDetail) {
      return res.status(404).send('Chi tiết hóa đơn không tồn tại.');
    }
    else
      return next();
  } catch (error) {
    return handleErrorResponse(res, 500, error);
  }
};

module.exports = {
  checkExistOrderDetail,
};
