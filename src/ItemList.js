import React from "react";
import Item from "./Item";
import AddItemListItem from "./AddItemListItem";
import styles from "./ItemList.module.css";

function ItemList(props) {
  const itemElement = (item) => (
    <Item
      key={item.id}
      text={item.text}
      isCompleted={item.isCompleted}
      onValueChange={props.onValueChange}
      onCheckClick={props.onCheckClick}
      onInputEnter={props.onInputEnter}
      id={item.id}
      isOpen={item.isOpen}
      onBlur={props.onBlur}
      orderId={item.orderId}
    ></Item>
  );
  const items = props.items
    .filter((item) => !item.isCompleted)
    .sort((itemA, itemB) => itemA.orderId - itemB.orderId)
    .map((item) => itemElement(item));
  const completed = props.items
    .filter((item) => item.isCompleted)
    .sort((itemA, itemB) => itemA.orderId - itemB.orderId)
    .map((item) => itemElement(item));

  return (
    <ul className={styles.ItemList}>
      {items}
      <AddItemListItem onAddItemClick={props.onAddItemClick}>
        New item
      </AddItemListItem>
      {completed}
    </ul>
  );
}

export default ItemList;
