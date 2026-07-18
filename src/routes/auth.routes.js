const express = require("express");
const {
  UserController,
  loginController,
  logoutController,
  getMeController,
} = require("../controllers/user.controller");
const { authUser } = require("../middleware/auth.middleware");
const authRouter = express.Router();

authRouter.post("/signUp", UserController);
authRouter.post("/login", loginController);
authRouter.get("/logout", logoutController);
authRouter.get("/get-me", authUser, getMeController);

module.exports = authRouter;
