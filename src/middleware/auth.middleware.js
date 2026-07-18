const jwt = require("jsonwebtoken");
const tokenBlackListModel = require("../models/blacklist.model");

async function authUser(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      message: "Token not provided!!",
    });
  }

  const isTokenBlackListed = await tokenBlackListModel.findOne({
    token
  })

  if(isTokenBlackListed) {
    return res.status(401).json({
        message: "Unautorization Token"
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
    // console.log(decoded)

    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid Token",
    });
  }
}


module.exports = { authUser }