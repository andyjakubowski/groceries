import React from "react";
import Item from "./Item";

function ItemList(props) {
  return (
    <ul>
      {props.items.map((item) => (
        <Item
          key={item.text}
          text={item.text}
          isCompleted={item.isCompleted}
          onChange={() => console.log("click")}
        ></Item>
      ))}
    </ul>
  );
}

export default ItemList;
