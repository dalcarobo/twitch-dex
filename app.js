const express = require("express");
const _ = require("underscore");
const fetch = require("node-fetch");
const unifont = require("./unifont");
const app = express();

const CMD = "!dex";

async function getBy_(q, t) {
  const response = await fetch(`https://pokeapi.co/api/v2/${t}/${q}`);
  if (response.status === 404) return null;
  const data = await response.json();
  return data;
}

app.get("/", async function (req, res) {
  let out = "";
  const random = Math.floor(Math.random() * 1292) + 1;
  const pkmn = await getBy_(random, "pokemon");
  out += unifont(`🎲 RANDOM 🎲 \n`, "bold");
  out += printPokemon(pkmn);

  res.set({
    "content-type": "text/plain; charset=utf-8",
  });
  res.send(out);
});

app.get("/about", function (req, res) {
  let out = "";
  out += ` ${unifont("ABOUT", "sansbold")} 🛈\n`;
  out += ` ➤ This command is brought to you by https://twitch.tv/ocarbono\n`;
  out += ` ➤ Thanks to @victornpb for the fork!\n`;
  out += ` ➤ It uses the PokeAPI source.\n`;
  res.set({
    "content-type": "text/plain; charset=utf-8",
  });
  res.send(out);
});

app.get("/help", function (req, res) {
  let out = "";
  out += ` ${unifont("HELP", "sansbold")} ❓\n`;
  out += ` ➤ "${unifont(CMD, "sansbold")}" to get a random Pokemon.\n`;
  out += ` ➤ "${unifont(CMD + " pikachu", "sansbold")}" or "${unifont(
    CMD + " 25",
    "sansbold"
  )}" to see the Pokedex info about Pikachu.\n`;
  out += ` ➤ "${unifont(
    CMD + " ability overgrow",
    "sansbold"
  )}" to search pokemons with that ability.\n`;
  out += ` ➤ "${unifont(
    CMD + " type electric",
    "sansbold"
  )}" to search pokemons with that type.\n`;
  out += ` ➤ "${unifont(
    CMD + " about",
    "sansbold"
  )}" to see about this command.\n`;

  res.set({
    "content-type": "text/plain; charset=utf-8",
  });
  res.send(out);
});

app.get("/:q", async function (req, res) {
  let out = "";
  var q = String(req.params.q).trim();
  if (q.match(/^!\w+ ?/)) q = q.replace(/^!\w+ ?/, ""); // remove !dex prefix if present because streamelements includes it
  if (q.trim() === "") return res.redirect("/dex");

  const QUERY_BY_TYPE = /^(types?) (.*)/;
  const QUERY_BY_ABILITY = /^(ability?) (.*)/;

  if (QUERY_BY_TYPE.test(q)) {
    let t = QUERY_BY_TYPE.exec(q)[2];
    const pkmn = await getBy_(t, "type");
    if (!pkmn) {
      out =
        unifont(`❌ This type is not on the database!`, "sansbold") + ` (${t})`;
    } else {
      out = printAbilityPokemon(pkmn);
    }
  } else if (QUERY_BY_ABILITY.test(q)) {
    let t = QUERY_BY_ABILITY.exec(q)[2];
    const pkmn = await getBy_(t, "ability");
    if (!pkmn) {
      out =
        unifont(`❌ This ability is not on the database!`, "sansbold") +
        ` (${t})`;
    } else {
      out = printAbilityPokemon(pkmn);
    }
  } else {
    if (q) {
      const pkmn = await getBy_(q, "pokemon");
      if (!pkmn) {
        out =
          unifont(`❌ This Pokemon is not on the database!`, "sansbold") +
          ` (${q})`;
      } else {
        out = printPokemon(pkmn);
      }
    } else {
      out =
        unifont(`🕵 This Pokemon is not on the database!`, "sansbold") +
        ` (${q})`;
    }
  }

  res.set({
    "content-type": "text/plain; charset=utf-8",
  });
  res.send(out);
});

function printAbilityPokemon(p) {
  return p.pokemon.map((a) => a.pokemon.name).join("|");
}

function printPokemon(p) {
  const ABREV = {
    hp: "HP",
    attack: "ATK",
    defense: "DEF",
    "special-attack": "spATK",
    "special-defense": "spDEF",
    speed: "SPEED",
  };

  const name = `#${p.id} - ${unifont(p.name.toUpperCase(), "sansbolditalic")}`;
  const type = "- TYPE: " + p.types.map((a) => a.type.name).join("|");
  const abilities =
    "- ABIL: " + p.abilities.map((a) => a.ability.name).join("/");
  const base_stats =
    "- BASE: " +
    p.stats.map((a) => ABREV[a.stat.name] + " " + a.base_stat).join("|");

  const out = [name, type, abilities, base_stats];

  return out.join(" ");
}

app.listen(3000, function () {
  console.log("Example app listening on port 3000!");
});

module.exports = app;
