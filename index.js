const express = require("express");
const port = 3000 || process.env.PORT;
const app = express();
const cors = require("cors");
const dotenv = require("dotenv").config();
app.use(express.json());
app.use(cors());
const createUser = async (name, email, pass) => {
  const dataBase = require("./db");

  const usersTable = await dataBase.insertUsers(name, email, pass);
  return usersTable;
};

const getEmailAndPass = async (email, pass) => {
  const dataBase = require("./db");
  const verifyConnection = await dataBase.getEmailPassUsers(email, pass);
  return verifyConnection;
};

app.post("/", async (req, res) => {
  try {
    const userInfo = [req.body.nome, req.body.email, req.body.senha];
    const validateUserName = userInfo[0].length > 3;
    const validateEmail =
      userInfo[1].includes("@") == true && userInfo[1].includes(".") == true;
    const validePassword =
      userInfo[2].length > 7 &&
      userInfo[2].search(/[A-Z]/) != -1 &&
      userInfo[2].search(/[-\#\$\.\%\&\*\@\?\!]/) != -1;
    const existEmail = await getEmailAndPass(req.body.email);

    if (existEmail != "") {
      res.status(400).send("Bad Request");
    } else {
      if (validateUserName && validateEmail && validePassword) {
        res.status(200).send("Succesfull");
        await createUser(req.body.nome, req.body.email, req.body.senha);
      } else {
        res.status(406).send("error");
      }
    }
  } catch (error) {
    console.log(error);
  }
});
app.get("/:email/:pass", async (req, res) => {
  const emailUser = req.params.email;
  const passUser = req.params.pass;
  const returnResponse = await getEmailAndPass(emailUser);

  if (returnResponse != "") {
    const returnResponseEmail = await returnResponse[0].email;

    const returnResponsePass = await returnResponse[0].pass;
    if (returnResponseEmail == emailUser && returnResponsePass == passUser) {
      res.status(200).send();
    } else {
      res.status(401).send();
    }
  } else {
    res.status(501).send();
  }
});

app.listen(port, () => {
  console.log("Running");
});
