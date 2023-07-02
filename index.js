const express = require("express");
require("dotenv").config();
const pgp = require("pg-promise")(/* options */);
const app = express();
const port = 5173;
const db = pgp(
  `postgres://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
);

app.get("/fill-db", async (req, res) => {
  // esta desconstructuracion es lo mismo que:
  // const response = await db.one(...)
  // const dbExists = response.exists
  const { exists: dbExists } = await db.one(
    `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pokemons');`,
  );
  if (!dbExists) {
    await db.none(
      "CREATE TABLE pokemons (id INT PRIMARY KEY, name VARCHAR(255), type1 VARCHAR(255), type2 VARCHAR(255));",
    );
  }

  const fetchAllFirstPokemons = await fetch(
    `https://pokeapi.co/api/v2/pokemon?limit=151`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  );
  const { results: allFirstPokemons } = await fetchAllFirstPokemons.json();
  const currentDBResponse = await db
    .many("SELECT * FROM pokemons")
    .catch(() => []); // este catch hace que si la tabla esta vacia retorna un array vacio en vez de un error
  const currentPokemonsInDB = new Map(); // esta logica es para chequear si el pokemon ya esta en la db, si ya esta no lo agrega
  currentDBResponse.forEach((pokemon) => {
    currentPokemonsInDB.set(pokemon.id, pokemon);
  });
  allFirstPokemons.forEach(async (pokemon) => {
    const fetchPokemon = await fetch(pokemon.url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const pokemonData = await fetchPokemon.json();
    const { id, name, types } = pokemonData;
    const type1 = types[0].type.name;
    const type2 = types[1] ? types[1].type.name : null;

    if (!currentPokemonsInDB.has(id)) {
      // si el pokemon no esta en la db lo agrega
      await db.none(
        `INSERT INTO pokemons (id, name, type1, type2) VALUES (${id}, '${name}', '${type1}', '${type2}');`,
      );
    }
  });
  // estuve chequeando que url esta funcionando para traer los sprites mas bonitos y consegui esta: https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/151.png
  // solo tienen que cambiar el ultimo numero por el id del pokemon que quieran
  res.send("done, check your db");
});

app.get("/get-all-pokemons", async (req, res) => {
  const allPokemons = await db.many("SELECT * FROM pokemons ORDER BY id ASC;");
  res.send(allPokemons);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// fetch('localhost:5173/get-pokemons',{method: 'GET'})
