const checkExist = (Model) => {
  return async (req, res, next) => {
    const primaryKeyFields = Object.keys(Model.primaryKeys);
    const primaryKeyValues = primaryKeyFields.map((key) => req.params[key]);
    const whereCondition = Object.fromEntries(
      primaryKeyFields.map((key, index) => [key, primaryKeyValues[index]])
    );

    try {
      const object = await Model.findOne({
        where: whereCondition,
      });
      if (!object) {
        return res.status(404).send({ message: "Item not Found" });
      }

      return next();
    } catch (error) {
      return handleErrorResponse(res, 500, error);
    }
  };
};

module.exports = checkExist;
