import React from "react";
import "./App.css";
import ItemList from "./ItemList";
import seedData from "./seedData";
import { v4 as uuid } from "uuid";
import client from "./client";

const LOCAL_STORAGE_KEY = "groceries";
const getData = () =>
  JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY)) || seedData;
const saveData = (data) =>
  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));

function newItem({ orderId, isOpen }) {
  const item = {
    orderId,
    isOpen,
    id: uuid(),
    text: "",
    isCompleted: false,
  };

  return item;
}

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = getData();

    this.handleAddItemClick = this.handleAddItemClick.bind(this);
    this.handleDeleteItemClick = this.handleDeleteItemClick.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.handleCheckClick = this.handleCheckClick.bind(this);
    this.handleItemBlur = this.handleItemBlur.bind(this);
    this.handleInputEnter = this.handleInputEnter.bind(this);
  }

  componentDidMount() {
    client.getItems((items) => {
      console.log("Got the items:");
      console.log(items);
    });
  }

  componentDidUpdate() {
    saveData(this.state);
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

    const item = newItem({ orderId, isOpen: true });

    this.setState({
      items: this.state.items.concat(item),
    });
  }

  handleDeleteItemClick({ id }) {
    this.setState({
      items: this.state.items.filter((item) => item.id !== id),
    });
  }

  handleItemBlur({ id }) {
    this.setState({
      items: this.state.items.map((item) => {
        if (item.id === id) {
          return Object.assign({}, item, {
            isOpen: false,
          });
        } else {
          return item;
        }
      }),
    });
  }

  handleInputEnter({ orderId }) {
    const newItemOrderId = orderId + 1;
    const item = newItem({ orderId: newItemOrderId, isOpen: true });

    this.setState({
      items: this.state.items
        .map((item) => {
          if (item.orderId >= newItemOrderId) {
            return Object.assign({}, item, {
              orderId: item.orderId + 1,
            });
          } else {
            return item;
          }
        })
        .concat(item),
    });
  }

  handleValueChange({ id, text }) {
    this.setState({
      items: this.state.items.map((item) => {
        if (item.id === id) {
          return Object.assign({}, item, {
            text,
          });
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
          return Object.assign({}, item, {
            isCompleted: !item.isCompleted,
            orderId,
          });
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
          <h1>Linda from Purcha$ing</h1>
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
      </div>
    );
  }
}

export default App;
