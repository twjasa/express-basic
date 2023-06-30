const express = require("express");
require("dotenv").config();
const app = express();
const port = 5173;
// const pgp = require("pg-promise")(/* options */);
// const db = pgp(
//   `postgres://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME})`,
// );

app.get("/get-pokemons", async (req, res) => {
  // db.one("SELECT $1 AS value", 123)
  //   .then((data) => {
  //     res.send("FUNCIONE!");
  //   })
  //   .catch((error) => {
  //     console.log("ERROR:", error);
  //   });
  const limit = req.query.limit || 20;
  const allFirstPokemons = await fetch(
    `https://pokeapi.co/api/v2/pokemon?limit=${limit}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  );
  const response = await allFirstPokemons.json();
  res.send(response);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// fetch('localhost:5173/get-pokemons',{method: 'GET'})
