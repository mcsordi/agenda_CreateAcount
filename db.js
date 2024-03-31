const dotenv = require("dotenv").config();

const connection = async () => {
  if (global.connection && global.connection.state != "disconnected")
    return global.connection;
  const mysql = require("mysql2/promise");
  const connector = mysql.createConnection(process.env.DATABASE_URL);
  console.log("conectou ao BD");
  global.connection = connector;
  return connector;
};
connection();

const getEmailPassUsers = async (email, pass) => {
  const usersDB = await connection();
  const query = "select email,pass from users where email = ?";
  const [validateClient] = await usersDB.query(query, [email]);

  return validateClient;
};

const insertUsers = async (name, email, pass) => {
  const usersDB = await connection();
  try {
    const insertClient = await usersDB.query(
      "INSERT INTO users (id,name, email, pass) VALUES ((select count(u.id)+1 as id  from users u),?, ?, ?)",
      [name, email, pass]
    );

    return insertClient;
  } catch (error) {
    return error;
  }
};

module.exports = { getEmailPassUsers, insertUsers };
