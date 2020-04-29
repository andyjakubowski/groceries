import React from "react";
import "./App.css";
import ItemList from "./ItemList";
import data from "./seedData";
import { v4 as uuid } from "uuid";

const initialState = data;

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = initialState;

    this.handleAddItemClick = this.handleAddItemClick.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.handleCheckClick = this.handleCheckClick.bind(this);
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

    this.setState({
      items: this.state.items.concat({
        orderId,
        id: uuid(),
        text: "",
        isCompleted: false,
      }),
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
    const items = this.state.items
      .filter((item) => !item.isCompleted)
      .sort((itemA, itemB) => itemA.orderId - itemB.orderId);
    const completed = this.state.items
      .filter((item) => item.isCompleted)
      .sort((itemA, itemB) => itemA.orderId - itemB.orderId);

    return (
      <div className="App">
        <header className="AppHeader">
          <h1>Groceries</h1>
        </header>
        <ItemList
          items={items}
          onValueChange={this.handleValueChange}
          onCheckClick={this.handleCheckClick}
        />
        <AddItemButton onClick={this.handleAddItemClick}>
          Add new item
        </AddItemButton>
        <ItemList
          items={completed}
          onValueChange={this.handleValueChange}
          onCheckClick={this.handleCheckClick}
        />
      </div>
    );
  }
}

function AddItemButton(props) {
  return <button onClick={props.onClick}>{props.children}</button>;
}

export default App;
