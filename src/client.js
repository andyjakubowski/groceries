console.log(`Environment: ${process.env.NODE_ENV}`);
const API_URL = "https://linda-groceries.herokuapp.com";
const HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

const client = {
  getItems(success) {
    fetch(`${API_URL}/items`, {
      headers: HEADERS,
    })
      .then(parseJSON)
      .then(success);
  },

  createItem(item) {
    fetch(`${API_URL}/items`, {
      method: "post",
      headers: HEADERS,
      body: JSON.stringify(item),
    });
  },

  updateItem(item) {
    fetch(`${API_URL}/items/${item.id}`, {
      method: "put",
      headers: HEADERS,
      body: JSON.stringify(item),
    });
  },

  deleteItem(id) {
    fetch(`${API_URL}/items/${id}`, {
      method: "delete",
    });
  },
};

function parseJSON(response) {
  return response.json();
}

export default client;
