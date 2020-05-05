import React from "react";
import "./App.css";
import ItemList from "./ItemList";
import AddItemButton from "./AddItemButton";
import { v4 as uuid } from "uuid";
import client from "./client";

const LOCAL_STORAGE_KEY = "groceries";
const getLocalStorageState = function getLocalStorageState() {
  const state = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY));

  return state || { items: [] };
};

const saveData = (data) =>
  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = getLocalStorageState();

    this.handleAddItemClick = this.handleAddItemClick.bind(this);
    this.handleDeleteItemClick = this.handleDeleteItemClick.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.handleCheckClick = this.handleCheckClick.bind(this);
    this.handleItemBlur = this.handleItemBlur.bind(this);
    this.handleInputEnter = this.handleInputEnter.bind(this);
  }

  componentDidMount() {
    client.getItems((items) => {
      this.setState({ items });
    });

    client.subscribeToUpdates({
      onConnected: this.handleConnected,
      onDisconnected: this.handleDisconnected,
      onReceived: this.handleReceived,
    });
  }

  componentDidUpdate() {
    saveData(this.state);
  }

  handleConnected() {
    console.log("Connected to ListChannel.");
  }

  handleDisconnected() {
    console.log("Disconnected from ListChannel.");
  }

  handleReceived(data) {
    console.log("Received data from ListChannel.");
    switch (data.message_type) {
      case "item_create":
        console.log("item_create");
        break;
      default:
        console.log("unhandled message type");
    }
  }

  createItem({
    id = uuid(),
    orderId,
    text = "",
    isCompleted = false,
    isOpen = false,
  }) {
    const newItem = {
      id,
      orderId,
      text,
      isCompleted,
      isOpen,
    };

    this.setState({
      items: this.state.items
        .map((item) => {
          if (item.orderId >= newItem.orderId) {
            return Object.assign({}, item, {
              orderId: item.orderId + 1,
            });
          } else {
            return item;
          }
        })
        .concat(newItem),
    });

    return newItem;
  }

  handleAddItemClick() {
    const orderIds = this.state.items
      .filter((item) => !item.isCompleted)
      .map((item) => item.orderId);

    let orderId;

    if (orderIds.length > 0) {
      orderId = Math.max(...orderIds) + 1;
    } else {
      orderId = 0;
    }

    const item = this.createItem({ orderId, isOpen: true });
    client.createItem(item);
  }

  handleInputEnter({ orderId }) {
    const newItemOrderId = orderId + 1;
    const item = this.createItem({ orderId: newItemOrderId, isOpen: true });

    client.createItem(item);
  }

  handleDeleteItemClick({ id }) {
    this.setState({
      items: this.state.items.filter((item) => item.id !== id),
    });

    client.deleteItem(id);
  }

  handleItemBlur({ id }) {
    this.setState({
      items: this.state.items.map((item) => {
        if (item.id === id) {
          const updated = Object.assign({}, item, {
            isOpen: false,
          });
          client.updateItem(updated);
          return updated;
        } else {
          return item;
        }
      }),
    });
  }

  handleValueChange({ id, text }) {
    this.setState({
      items: this.state.items.map((item) => {
        if (item.id === id) {
          const updated = Object.assign({}, item, {
            text,
          });
          client.updateItem(updated);
          return updated;
        } else {
          return item;
        }
      }),
    });
  }

  handleCheckClick({ id, isCompleted }) {
    const orderIds = this.state.items
      .filter((item) => item.isCompleted === !isCompleted)
      .map((item) => item.orderId);
    let orderId;

    if (orderIds.length > 0) {
      orderId = isCompleted
        ? Math.max(...orderIds) + 1
        : Math.min(...orderIds) - 1;
    } else {
      orderId = 0;
    }

    this.setState({
      items: this.state.items.map((item) => {
        if (item.id === id) {
          const updated = Object.assign({}, item, {
            isCompleted: !item.isCompleted,
            orderId,
          });
          client.updateItem(updated);
          return updated;
        } else {
          return item;
        }
      }),
    });
  }

  render() {
    return (
      <div className="App">
        <header className="AppHeader">
          <h1 className="AppHeaderHeading">Linda from Purcha$ing</h1>
        </header>
        <ItemList
          items={this.state.items}
          onValueChange={this.handleValueChange}
          onCheckClick={this.handleCheckClick}
          onBlur={this.handleItemBlur}
          onInputEnter={this.handleInputEnter}
          onAddItemClick={this.handleAddItemClick}
          onDeleteClick={this.handleDeleteItemClick}
        />
        <AddItemButton onClick={this.handleAddItemClick} />
      </div>
    );
  }
}

export default App;
