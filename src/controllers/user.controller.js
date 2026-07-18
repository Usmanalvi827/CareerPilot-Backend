const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/user.model");
const tokenBlackListModel = require("../models/blacklist.model");

const UserController = async (req, res) => {
  try {
    const { firstname, lastname, username, email, password } = req.body;

    if (!firstname?.trim() || !lastname?.trim() || !username?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        message: "Validation failed: All fields are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password security requirement not met: Minimum 6 characters required.",
      });
    }

    const isUserExist = await UserModel.findOne({
      $or: [{ username: username }, { email: email }],
    });

    if (isUserExist) {
      return res.status(409).json({ 
        message: "An account with this email address or username already exists.",
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await UserModel.create({
      firstname,
      lastname,
      username,
      email,
      password: hash,
    });

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      process.env.JWT_SECRET_TOKEN,
      { expiresIn: "1d" },
    );

    res.cookie("token", token, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production"
    });

    return res.status(201).json({
      message: "Your account has been registered successfully.",
      user: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        email: user.email,
        token: token,
      },
    });
  } catch (error) {
    // console.log(error);
    return res.status(500).json({
      message: "An internal server error occurred. Please try again later.",
    });
  }
};


const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        message: "Authentication failed: All fields are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password security requirement not met: Minimum 6 characters required.",
      });
    }

    const userFind = await UserModel.findOne({ email: email });

    if (!userFind) {
      return res.status(401).json({ // Changed to 401 Unauthorized
        message: "Invalid credentials: The email or password provided is incorrect.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, userFind.password);

    if (!isPasswordValid) {
      return res.status(401).json({ // Changed to 401 Unauthorized
        message: "Invalid credentials: The email or password provided is incorrect.",
      });
    }

    const token = jwt.sign(
      {
        id: userFind._id,
        username: userFind.username,
        email: userFind.email,
      },
      process.env.JWT_SECRET_TOKEN,
      { expiresIn: "1d" },
    );

    res.cookie("token", token, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production"
    });

    return res.status(200).json({
      message: "Authentication successful. Welcome back!",
      user: { 
        id: userFind._id,
        username: userFind.username,
        email: userFind.email,
      },
    });
    
  } catch (err) {
    // console.log(err); 
    
    return res.status(500).json({
      message: "An internal server error occurred. Please try again later.",
    });
  }
};


const logoutController = async (req, res) => {
  const token = req.cookies.token;

  if (token) {
    await tokenBlackListModel.create({
      token,
    });
  }

  res.clearCookie("token");

  res.status(200).json({
    message: "User Logged out Sucessfully!!",
  });
};

const getMeController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      message: "Users Details Fetch Successfully!!",
      users: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    // console.log(error);
    res.status(500).json({ message: "Failed to fetch user details." });
  }
};

module.exports = {
  UserController,
  loginController,
  logoutController,
  getMeController,
};
