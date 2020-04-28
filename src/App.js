import React from "react";
import "./App.css";
import ItemList from "./ItemList";

function App() {
  const data = {
    items: [
      {
        text: "Apples",
        isCompleted: false,
      },
      {
        text: "Oranges",
        isCompleted: false,
      },
    ],
    completed: [
      {
        text: "Eggs",
        isCompleted: true,
      },
      {
        text: "Yoghurt",
        isCompleted: true,
      },
    ],
  };

  return (
    <div className="App">
      <header className="AppHeader">
        <h1>Groceries</h1>
      </header>
      <ItemList items={data.items} />
      <ItemList items={data.completed} />
    </div>
  );
}

export default App;
