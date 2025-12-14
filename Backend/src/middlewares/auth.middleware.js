import jwt from "jsonwebtoken";
import { asyncHandler } from "../utility/asyncHandler.js";
import { ApiError } from "../utility/ApiError.js";

import { Admin } from "../src/modals/admin/admin.modals.js";
import { Student } from "../src/modals/user/student.modal.js";
import { Employee } from "../src/modals/user/employee.modal.js";

const verifyStudentJWT = asyncHandler(async (req, res, next) => {
  console.log(req.cookies);

  const accessToken = req.cookies?.accessToken;

  if (!accessToken) {
    throw new ApiError(401, "Token is not verified");
  }

  const tokenDecoding = jwt.verify(
    accessToken,
    process.env.ACCESS_TOKEN_SECRETKEY
  );

  const verificationOfUser = await Student.findById(tokenDecoding._id).select(
    "-password -refreshToken"
  );

  if (!verificationOfUser) {
    throw new ApiError(401, "Token is not verified and user is not found");
  }

  req.verificationOfUser = verificationOfUser;
  next();
});

const verifyEmployeeJWT = asyncHandler(async (req, res, next) => {
  const accessToken = req.cookies?.accessToken;

  if (!accessToken) {
    throw new ApiError(401, "Token is not verified");
  }

  const tokenDecoding = jwt.verify(
    accessToken,
    process.env.ACCESS_TOKEN_SECRETKEY
  );

  const verificationOfUser = await Employee.findById(tokenDecoding._id).select(
    "-password -refreshToken"
  );

  if (!verificationOfUser) {
    throw new ApiError(401, "Token is not verified and user is not found");
  }

  req.verificationOfUser = verificationOfUser;
  next();
});

const verifyAdminJWT = asyncHandler(async (req, res, next) => {
  const accessToken = req.cookies?.accessToken;

  if (!accessToken) {
    throw new ApiError(401, "Token is not verified");
  }

  const tokenDecoding = jwt.verify(
    accessToken,
    process.env.ACCESS_TOKEN_SECRETKEY
  );

  const verificationOfUser = await Admin.findById(tokenDecoding._id).select(
    "-password -refreshToken"
  );

  if (!verificationOfUser) {
    throw new ApiError(401, "Token is not verified and user is not found");
  }

  req.verificationOfUser = verificationOfUser;
  next();
});

export {
  verifyStudentJWT,
  verifyEmployeeJWT,
  verifyAdminJWT
};
