const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// In-memory array: data resets when the server restarts.
let items = [
  { id: 1, name: "Book", price: 250 },
  { id: 2, name: "Pen", price: 25 }
];
let nextId = 3;

// READ: get all items
app.get("/api/items", (req, res) => {
  res.json(items);
});

// READ: get one item
app.get("/api/items/:id", (req, res) => {
  const item = items.find(item => item.id === Number(req.params.id));
  if (!item) return res.status(404).json({ message: "Item not found" });
  res.json(item);
});

// CREATE: add an item
app.post("/api/items", (req, res) => {
  const { name, price } = req.body;
  const cleanName = typeof name === "string" ? name.trim() : "";
  const numericPrice = Number(price);

  if (!cleanName || price === "" || price === undefined ||
      !Number.isFinite(numericPrice) || numericPrice < 0) {
    return res.status(400).json({ message: "Enter a name and a valid price (0 or more)." });
  }

  const item = { id: nextId++, name: cleanName, price: numericPrice };
  items.push(item);
  res.status(201).json(item);
});

// UPDATE: replace an item's name and price
app.put("/api/items/:id", (req, res) => {
  const item = items.find(item => item.id === Number(req.params.id));
  if (!item) return res.status(404).json({ message: "Item not found" });

  const { name, price } = req.body;
  const cleanName = typeof name === "string" ? name.trim() : "";
  const numericPrice = Number(price);

  if (!cleanName || price === "" || price === undefined ||
      !Number.isFinite(numericPrice) || numericPrice < 0) {
    return res.status(400).json({ message: "Enter a name and a valid price (0 or more)." });
  }

  item.name = cleanName;
  item.price = numericPrice;
  res.json(item);
});

// DELETE: remove an item
app.delete("/api/items/:id", (req, res) => {
  const index = items.findIndex(item => item.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ message: "Item not found" });

  const deleted = items.splice(index, 1)[0];
  res.json({ message: "Item deleted", item: deleted });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
