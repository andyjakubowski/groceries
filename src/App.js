import React from "react";
import "./App.css";
import ItemList from "./ItemList";
import { arrayLast } from "./utilities";
import data from "./seedData";

const initialState = data;

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = initialState;

    this.handleValueChange = this.handleValueChange.bind(this);
    this.handleCheckClick = this.handleCheckClick.bind(this);
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
        <ItemList
          items={completed}
          onValueChange={this.handleValueChange}
          onCheckClick={this.handleCheckClick}
        />
      </div>
    );
  }
}

export default App;
