const express = require("express");
const path = require("path");
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Start with an empty array. Items reset when the server restarts.
let items = [];
let nextId = 1;

app.get("/api/items", (req, res) => res.json(items));

app.get("/api/items/:id", (req, res) => {
  const item = items.find(x => x.id === Number(req.params.id));
  if (!item) return res.status(404).json({ message: "Item not found" });
  res.json(item);
});

app.post("/api/items", (req, res) => {
  const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
  const price = Number(req.body.price);
  if (!name || req.body.price === "" || req.body.price === undefined ||
      !Number.isFinite(price) || price < 0) {
    return res.status(400).json({ message: "Enter a name and a valid price (0 or more)." });
  }
  const item = { id: nextId++, name, price };
  items.push(item);
  res.status(201).json(item);
});

app.put("/api/items/:id", (req, res) => {
  const item = items.find(x => x.id === Number(req.params.id));
  if (!item) return res.status(404).json({ message: "Item not found" });
  const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
  const price = Number(req.body.price);
  if (!name || req.body.price === "" || req.body.price === undefined ||
      !Number.isFinite(price) || price < 0) {
    return res.status(400).json({ message: "Enter a name and a valid price (0 or more)." });
  }
  item.name = name;
  item.price = price;
  res.json(item);
});

app.delete("/api/items/:id", (req, res) => {
  const index = items.findIndex(x => x.id === Number(req.params.id));
  if (index < 0) return res.status(404).json({ message: "Item not found" });
  res.json({ message: "Item deleted", item: items.splice(index, 1)[0] });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
