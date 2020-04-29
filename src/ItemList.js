import React from "react";
import Item from "./Item";
import styles from "./ItemList.module.css";

function ItemList(props) {
  return (
    <ul className={styles.ItemList}>
      {props.items.map((item) => (
        <Item
          key={item.id}
          text={item.text}
          isCompleted={item.isCompleted}
          onValueChange={props.onValueChange}
          onCheckClick={props.onCheckClick}
          id={item.id}
        ></Item>
      ))}
    </ul>
  );
}

export default ItemList;
