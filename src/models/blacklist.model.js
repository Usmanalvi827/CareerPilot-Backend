const mongoose = require("mongoose");

const tokenBlackListSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: [true, "token is required to be added in blackKist!!"],
    },
  },
  { timestamps: true },
);


const tokenBlackListModel = mongoose.model("tokenblacklisttokens", tokenBlackListSchema);

module.exports = tokenBlackListModel;