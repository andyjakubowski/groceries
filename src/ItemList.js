import React from "react";
import Item from "./Item";
import styles from "./ItemList.module.css";

function ItemList(props) {
  return (
    <ul className={styles.ItemList}>
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
