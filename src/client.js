const API_URL = "http://localhost:3000";
const HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

const client = {
  getItems(success) {
    fetch(`${API_URL}/items`, {
      headers: HEADERS,
    })
      .then(checkStatus)
      .then(parseJSON)
      .then(success);
  },

  createItem(item) {
    fetch(`${API_URL}/items`, {
      method: "post",
      headers: HEADERS,
      body: JSON.stringify(item),
    }).then(checkStatus);
  },

  updateItem(item) {
    fetch(`${API_URL}/items/${item.id}`, {
      method: "put",
      headers: HEADERS,
      body: JSON.stringify(item),
    }).then(checkStatus);
  },
};

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    const error = new Error(`HTTP Error ${response.statusText}`);
    error.status = response.statusText;
    error.response = response;
    console.log(error);
    throw error;
  }
}

function parseJSON(response) {
  return response.json();
}

export default client;
