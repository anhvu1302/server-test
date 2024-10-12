const { ProductVariant } = require('../../models');

const checkProductVariantExistence = async (req, res, next) => {
  const { ColorId, SizeId } = req.body;
  const { ProductId } = req.query;
  try {
    const existingProtDetail = await ProductVariant.findOne({
      where: {
        ProductId,
        ColorId,
        SizeId
      }
    });
    if (!existingProtDetail) {
      return res.status(404).json({ message: 'Not found' });
    }
    return next();
  } catch (error) {
    res.status(500).json(error.message);
  }
};

module.exports = { checkProductVariantExistence };
