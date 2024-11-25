const { validationResult } = require("express-validator");

exports.onSuccess = (message, result, res) => {
  res.status(200).json({
    Message: message,
    Data: result,
    Status: 200,
    IsSuccess: true,
  });
};

exports.badrequest = (error, res) => {
  res.status(400).json({
    Message: error.message,
    Data: 0,
    Status: 400,
    IsSuccess: false,
  });
};

exports.onError = (error, res) => {
	res.status(500).json({
		Message: error.message,
		Data: 0,
		Status: 500,
		IsSuccess: false
	});
};

exports.unauthorisedRequest = (res) => {
	res.status(401).json({
		Message: "Unauthorized Request!",
		Data: 0,
		Status: 401,
		IsSuccess: false
	});
};

exports.schemaError = (msg, res) => {
  res.status(422).json({
    Message: msg,
    Data: 0,
    Status: 422,
    IsSuccess: false,
  });
};
