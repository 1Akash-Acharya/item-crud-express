const form = document.getElementById("item-form");
const itemIdInput = document.getElementById("item-id");
const nameInput = document.getElementById("name");
const priceInput = document.getElementById("price");
const itemsBody = document.getElementById("items-body");
const itemCount = document.getElementById("item-count");
const message = document.getElementById("message");
const formTitle = document.getElementById("form-title");
const submitButton = document.getElementById("submit-button");
const cancelButton = document.getElementById("cancel-button");
const listStatus = document.getElementById("list-status");

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Something went wrong.");
  return data;
}

function showMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle("error", isError);
}
function formatPrice(price) {
  return Number(price).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

async function loadItems() {
  itemsBody.innerHTML = '<tr><td colspan="4" class="empty">Loading your items…</td></tr>';
  try {
    const items = await apiRequest("/api/items");
    itemCount.textContent = items.length;
    itemsBody.replaceChildren();

    if (items.length === 0) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 4;
      cell.className = "empty";
      const icon = document.createElement("div");
      icon.className = "empty-icon";
      icon.textContent = "＋";
      const title = document.createElement("span");
      title.className = "empty-title";
      title.textContent = "Your list is empty";
      const hint = document.createElement("span");
      hint.className = "empty-hint";
      hint.textContent = "Add your first item using the form.";
      cell.append(icon, title, document.createElement("br"), hint);
      row.appendChild(cell);
      itemsBody.appendChild(row);
      listStatus.textContent = "Ready for your first item";
      return;
    }

    for (const item of items) {
      const row = document.createElement("tr");
      const id = document.createElement("td");
      id.textContent = item.id;
      const name = document.createElement("td");
      name.textContent = item.name;
      const price = document.createElement("td");
      price.className = "price-cell";
      price.textContent = `₹${formatPrice(item.price)}`;
      const actions = document.createElement("td");
      actions.className = "actions";

      const edit = document.createElement("button");
      edit.type = "button";
      edit.className = "table-button edit";
      edit.textContent = "Edit";
      edit.setAttribute("aria-label", `Edit ${item.name}`);
      edit.addEventListener("click", () => startEdit(item));

      const del = document.createElement("button");
      del.type = "button";
      del.className = "table-button delete";
      del.textContent = "Delete";
      del.setAttribute("aria-label", `Delete ${item.name}`);
      del.addEventListener("click", () => deleteItem(item.id));

      actions.append(edit, document.createTextNode(" "), del);
      row.append(id, name, price, actions);
      itemsBody.appendChild(row);
    }
    listStatus.textContent = `${items.length} item${items.length === 1 ? "" : "s"} in your collection`;
  } catch (error) {
    itemsBody.innerHTML = '<tr><td colspan="4" class="empty">Unable to load items. Make sure the server is running.</td></tr>';
    showMessage(error.message, true);
  }
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  const id = itemIdInput.value;
  const payload = { name: nameInput.value.trim(), price: priceInput.value };
  if (!payload.name || payload.price === "" || !Number.isFinite(Number(payload.price)) || Number(payload.price) < 0) {
    showMessage("Enter an item name and a valid price (0 or more).", true);
    return;
  }

  submitButton.disabled = true;
  try {
    if (id) {
      await apiRequest(`/api/items/${id}`, { method: "PUT", body: JSON.stringify(payload) });
      showMessage("Your item has been updated.");
    } else {
      await apiRequest("/api/items", { method: "POST", body: JSON.stringify(payload) });
      showMessage("Your item has been added.");
    }
    resetForm();
    await loadItems();
  } catch (error) {
    showMessage(error.message, true);
  } finally {
    submitButton.disabled = false;
  }
});

function startEdit(item) {
  itemIdInput.value = String(item.id);
  nameInput.value = item.name;
  priceInput.value = String(item.price);
  formTitle.textContent = "Edit item";
  submitButton.innerHTML = 'Save changes <span aria-hidden="true">↗</span>';
  cancelButton.classList.remove("hidden");
  showMessage(`Editing item #${item.id}.`);
  nameInput.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function deleteItem(id) {
  if (!window.confirm(`Delete item #${id}? This action cannot be undone.`)) return;
  try {
    await apiRequest(`/api/items/${id}`, { method: "DELETE" });
    if (itemIdInput.value === String(id)) resetForm();
    showMessage("Your item has been deleted.");
    await loadItems();
  } catch (error) {
    showMessage(error.message, true);
  }
}

function resetForm() {
  form.reset();
  itemIdInput.value = "";
  formTitle.textContent = "Add an item";
  submitButton.innerHTML = 'Add item <span aria-hidden="true">↗</span>';
  cancelButton.classList.add("hidden");
}
cancelButton.addEventListener("click", () => {
  resetForm();
  showMessage("Editing cancelled.");
});
loadItems();
