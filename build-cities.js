const fs = require("fs");

const input = "/home/mike/Downloads/cities15000.txt";
const output = "./public/cities_search_final.json";

const lines = fs.readFileSync(input, "utf8").split("\n");

const cities = [];

for (const line of lines) {
  const cols = line.split("\t");
  if (cols.length < 18) continue;

  const name = cols[1];
  const lat = parseFloat(cols[4]);
  const lng = parseFloat(cols[5]);
  const country = cols[8];
  const state = cols[10];
  const population = parseInt(cols[14] || "0", 10);
  const timezone = cols[17];

  if (!name || !timezone) continue;

  cities.push({
    name,
    country,
    state,
    timezone,
    lat,
    lng,
    population,

    // 🔥 CRITICAL FIX FOR SEARCH QUALITY
    search: `${name} ${state} ${country} ${name}, ${country}`.toLowerCase()
  });
}

// 🔥 IMPORTANT: SORT BY POPULATION (fixes “big cities missing”)
cities.sort((a, b) => b.population - a.population);

// optional cleanup: remove ultra tiny/empty entries
const filtered = cities.filter(c => c.name.length > 1);

fs.writeFileSync(output, JSON.stringify(filtered));

console.log("✅ Done:", filtered.length, "cities saved to", output);

