import React from "react";
import "./App.css";
import ItemList from "./ItemList";

const initialState = {
  items: [
    {
      id: 1,
      text: "Apples",
      isCompleted: false,
    },
    {
      id: 2,
      text: "Oranges",
      isCompleted: false,
    },
    {
      id: 3,
      text: "",
      isCompleted: false,
    },
    {
      id: 4,
      text: "Eggs",
      isCompleted: true,
    },
    {
      id: 5,
      text: "Yoghurt",
      isCompleted: true,
    },
  ],
};

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

  handleCheckClick({ id }) {
    this.setState({
      items: this.state.items.map((item) => {
        if (item.id === id) {
          return Object.assign({}, item, {
            isCompleted: !item.isCompleted,
          });
        } else {
          return item;
        }
      }),
    });
  }

  render() {
    const items = this.state.items.filter((item) => !item.isCompleted);
    const completed = this.state.items.filter((item) => item.isCompleted);

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
