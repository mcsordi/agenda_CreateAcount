const express = require("express");
const port = 3007 || process.env.PORT;
const app = express();
const dotenv = require("dotenv").config();
app.use(express.json());
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
  const userInfo = [req.body.nome, req.body.email, req.body.senha];
  try {
    const validateCadasteInfo = async () => {
      const validateUserName = userInfo[0].length > 3;
      const validateEmail =
        userInfo[1].includes("@") && userInfo[1].includes(".");
      const validePassword =
        userInfo[2].length > 7 &&
        userInfo[2].search(/[A-Z]/) != -1 &&
        userInfo[2].search(/[-\#\$\.\%\&\*\@\?\!]/) != -1;
      return validateUserName && validateEmail && validePassword;
    };
    const isValid = await validateCadasteInfo();
    console.log("app.post ~ isValid:", isValid);
    const existEmail = await getEmailAndPass(req.body.email);
    if (existEmail.length > 0) {
      res.status(400).send("Bad Request");
    } else {
      if (isValid) {
        res.status(200).send("Successful");
        const createUserMysql = await createUser(
          req.body.nome,
          req.body.email,
          req.body.senha
        );
        return createUserMysql;
      } else {
        res.status(406).send("Error");
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
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
