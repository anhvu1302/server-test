const handleErrorResponse = (res, statusCode, error) => {
  if (error.name === "SequelizeForeignKeyConstraintError") {
    return res.status(statusCode).send({
      message: "Cannot perform operation due to foreign key constraint.",
    });
  }
  if (error.name === "SequelizeDatabaseError") {
    return res.status(statusCode).send({
      message: "Database error",
    });
  }
  res.status(statusCode).send({
    message: error.message,
  });
};

module.exports = handleErrorResponse;
