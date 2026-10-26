const form = document.getElementById("item-form");
const itemIdInput = document.getElementById("item-id");
const nameInput = document.getElementById("name");
const priceInput = document.getElementById("price");
const itemsBody = document.getElementById("items-body");
const message = document.getElementById("message");
const formTitle = document.getElementById("form-title");
const submitButton = document.getElementById("submit-button");
const cancelButton = document.getElementById("cancel-button");

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }
  return data;
}

function showMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle("error", isError);
}

function formatPrice(price) {
  return Number(price).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
}

// READ: fetch items from the REST API and render the table
async function loadItems() {
  itemsBody.innerHTML = '<tr><td colspan="4" class="empty">Loading items...</td></tr>';

  try {
    const items = await apiRequest("/api/items");
    itemsBody.replaceChildren();

    if (items.length === 0) {
      itemsBody.innerHTML = '<tr><td colspan="4" class="empty">No items found. Add one above.</td></tr>';
      return;
    }

    for (const item of items) {
      const row = document.createElement("tr");

      const idCell = document.createElement("td");
      idCell.textContent = item.id;

      const nameCell = document.createElement("td");
      nameCell.textContent = item.name;

      const priceCell = document.createElement("td");
      priceCell.textContent = formatPrice(item.price);

      const actionCell = document.createElement("td");

      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.className = "edit";
      editButton.textContent = "Edit";
      editButton.addEventListener("click", () => startEdit(item));

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "delete";
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", () => deleteItem(item.id));

      actionCell.append(editButton, deleteButton);
      row.append(idCell, nameCell, priceCell, actionCell);
      itemsBody.appendChild(row);
    }
  } catch (error) {
    itemsBody.innerHTML = '<tr><td colspan="4" class="empty">Could not load items. Is the server running?</td></tr>';
    showMessage(error.message, true);
  }
}

// CREATE and UPDATE: POST for new items, PUT for existing items
form.addEventListener("submit", async event => {
  event.preventDefault();

  const id = itemIdInput.value;
  const payload = {
    name: nameInput.value.trim(),
    price: priceInput.value
  };

  if (!payload.name || payload.price === "" || Number(payload.price) < 0) {
    showMessage("Enter a name and a valid price (0 or more).", true);
    return;
  }

  submitButton.disabled = true;

  try {
    if (id) {
      await apiRequest(`/api/items/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });
      showMessage("Item updated successfully.");
    } else {
      await apiRequest("/api/items", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      showMessage("Item added successfully.");
    }

    resetForm();
    await loadItems();
  } catch (error) {
    showMessage(error.message, true);
  } finally {
    submitButton.disabled = false;
  }
});

// Fill the form with the selected item's values
function startEdit(item) {
  itemIdInput.value = item.id;
  nameInput.value = item.name;
  priceInput.value = item.price;
  formTitle.textContent = "Edit Item";
  submitButton.textContent = "Update";
  cancelButton.classList.remove("hidden");
  showMessage(`Editing item #${item.id}`);
  nameInput.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// DELETE: remove the selected item
async function deleteItem(id) {
  if (!window.confirm(`Are you sure you want to delete item #${id}?`)) return;

  try {
    await apiRequest(`/api/items/${id}`, { method: "DELETE" });
    if (itemIdInput.value === String(id)) resetForm();
    showMessage("Item deleted successfully.");
    await loadItems();
  } catch (error) {
    showMessage(error.message, true);
  }
}

function resetForm() {
  form.reset();
  itemIdInput.value = "";
  formTitle.textContent = "Add Item";
  submitButton.textContent = "Submit";
  cancelButton.classList.add("hidden");
}

cancelButton.addEventListener("click", () => {
  resetForm();
  showMessage("Edit cancelled.");
});

loadItems();
