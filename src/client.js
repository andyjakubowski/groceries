import { createConsumer } from "@rails/actioncable";

const HOST =
  process.env.NODE_ENV === "production"
    ? "linda-groceries.herokuapp.com"
    : "localhost:3000";
const API_URL =
  process.env.NODE_ENV === "production" ? `https://${HOST}` : `http://${HOST}`;
const CABLE_URL =
  process.env.NODE_ENV === "production"
    ? `wss://${HOST}/cable`
    : `ws://${HOST}/cable`;

const HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

const consumer = createConsumer(CABLE_URL);

const client = {
  subscribeToUpdates({ onConnected, onDisconnected, onReceived }) {
    consumer.subscriptions.create(
      {
        channel: "ListChannel",
      },
      {
        connected() {
          onConnected();
        },

        disconnected() {
          onDisconnected();
        },

        received(data) {
          onReceived(data);
        },
      }
    );
  },

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
