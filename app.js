const express = require("express");
const route = require("./rout");
const jwt = require("jsonwebtoken");
const app = express();
const optionsArr = [
  {
    method: "post",
    path: "/users/register",
    description: "Register, Required: email, name, password",
    example: {
      body: { email: "user@email.com", name: "user", password: "password" },
    },
  },
  {
    method: "post",
    path: "/users/login",
    description: "Login, Required: valid email and password",
    example: { body: { email: "user@email.com", password: "password" } },
  },
  {
    method: "post",
    path: "/users/token",
    description: "Renew access token, Required: valid refresh token",
    example: { headers: { token: "*Refresh Token*" } },
  },
  {
    method: "post",
    path: "/users/tokenValidate",
    description: "Access Token Validation, Required: valid access token",
    example: { headers: { Authorization: "Bearer *Access Token*" } },
  },
  {
    method: "get",
    path: "/api/v1/information",
    description: "Access user's information, Required: valid access token",
    example: { headers: { Authorization: "Bearer *Access Token*" } },
  },
  {
    method: "post",
    path: "/users/logout",
    description: "Logout, Required: access token",
    example: { body: { token: "*Refresh Token*" } },
  },
  {
    method: "get",
    path: "api/v1/users",
    description: "Get users DB, Required: Valid access token of admin user",
    example: { headers: { authorization: "Bearer *Access Token*" } },
  },
];

app.use(express.json());
app.options("/", (req, res) => {
  let token = req.get("authorization");
  if (!token) {
    return res.status(200).json(optionsArr.slice(0, 2));
  }
  token = token.slice(7);

  jwt.verify(token, "eyal543", (err, decoded) => {
    if (err) {
      return res.status(200).json(optionsArr.slice(0, 3));
    }
    if (!decoded.result.isAdmin) {
      return res.status(200).json(optionsArr.slice(0, 6));
    }
    return res.status(200).json(optionsArr);
  });
});

app.options("*", (req, res) => {
  res.status(404).send("unknown endpoint");
});
app.use("/", route);

module.exports = app;
