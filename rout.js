require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const USERS = [
  {
    email: "admin@email.com",
    name: "admin",
    password: "$2b$10$7QT3g8m1s925VZyPOa/9f.xjjJR9bq2.m1cm3ev..Yh2ECeNxQFfC",
    isAdmin: true,
  },
];
const bcrypt = require("bcrypt");
const { hashSync, genSaltSync, compareSync } = require("bcrypt");
const { sign } = require("jsonwebtoken");
const app = express.Router();
app.use(express.json());
app.use(cors());
const INFORMATION = [
  {
    email: "admin@email.com",
    info: "admin info",
  },
];
const REFRESHTOKENS = [];

/////////////////////////////////////////////////////////////////

app.post("/users/register", (req, res) => {
  const body = req.body;
  try {
    body.password = hashSync(body.password, genSaltSync(10));
    if (USERS.length === 0 && body.email === "admin@email.com") {
      body.isAdmin = true;
      USERS.push({
        email: body.email,
        name: body.name,
        password: body.password,
      });
      INFORMATION.push({
        email: `${body.email}`,
        info: `${body.name} info`,
      });
      return res.status(201).json({ message: "Register Success" });
    } else {
      const user = USERS.find((user) => user.email === body.email);
      if (user) {
        return res.status(409).json({ message: "user already exists" });
      } else {
        body.isAdmin = false;
        INFORMATION.push({
          email: `${body.email}`,
          info: `${body.name} info`,
        });
        USERS.push({
          email: body.email,
          name: body.name,
          password: body.password,
          isAdmin: false,
        });
        return res.status(201).json({ message: "Register Success" });
      }
    }
  } catch (err) {}
});

app.post("/users/login", (req, res) => {
  const body = req.body;
  try {
    const user = USERS.find((user) => user.email === body.email);
    if (!user) {
      return res.status(404).json({ message: "cannot find user" });
    }
    const isPasswordCorrect = compareSync(body.password, user.password);
    if (isPasswordCorrect) {
      const { isAdmin, email, name } = user;

      const accessToken = sign(
        { result: { isAdmin, email, name } },
        "eyal543",
        {
          expiresIn: "10s",
        }
      );
      const refreshToken = sign(
        { result: { isAdmin, email, name } },
        "543eyal",
        {
          expiresIn: "1d",
        }
      );
      REFRESHTOKENS.push(refreshToken);
      return res.status(200).json({
        refreshToken: refreshToken,
        accessToken: accessToken,
        email: body.email,
        name: user.name,
        isAdmin: user.isAdmin,
      });
    } else {
      return res.status(403).json({ message: "User or Password incorrect" });
    }
  } catch (err) {}
});

app.post("/users/tokenValidate", (req, res) => {
  let token = req.get("authorization");
  if (token) {
    // Remove Bearer from string
    token = token.slice(7);
    jwt.verify(token, "eyal543", (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid Access Token" });
      } else {
        req.decoded = decoded;
        return res.status(200).json({ valid: true });
      }
    });
  } else {
    return res.status(401).json({ message: "Access Token Required" });
  }
});

app.get("/api/v1/information", (req, res) => {
  let token = req.get("authorization");
  if (token) {
    token = token.slice(7);
    jwt.verify(token, "eyal543", (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid Access Token" });
      } else {
        return res.status(200).json([decoded.result]);
      }
    });
  } else {
    return res.status(401).json({ message: "Access Token Required" });
  }
});

app.post("/users/token", (req, res) => {
  let { token, user } = req.body;
  if (token) {
    const refToken = REFRESHTOKENS.includes(token);
    if (refToken) {
      const accessToken = sign({ result: user }, "eyal543", {
        expiresIn: "10s",
      });
      return res.status(200).json({ accessToken });
    } else {
      return res.status(403).json({ message: "Invalid Refresh Token" });
    }
  } else {
    return res.status(401).json({ message: "Refresh Token Required" });
  }
});

app.post("/users/logout", (req, res) => {
  let { token } = req.body;
  if (token) {
    const refToken = REFRESHTOKENS.includes(token);
    if (refToken) {
      REFRESHTOKENS.splice(REFRESHTOKENS[refToken], 1);
      return res.status(200).json({ message: "User Logged Out Successfully" });
    } else {
      return res.status(400).json({ message: "Invalid Refresh Token" });
    }
  } else {
    return res.status(400).json({ message: "Refresh Token Required" });
  }
});

app.get("/api/v1/users", (req, res) => {
  let token = req.get("authorization");
  if (token) {
    token = token.slice(7);
    jwt.verify(token, "eyal543", (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid Access Token" });
      } else {
        return res.status(200).json(USERS);
      }
    });
  } else {
    return res.status(401).json({ message: "Access Token Required" });
  }
});

module.exports = app;
