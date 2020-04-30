import React from "react";
import Item from "./Item";
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

  const elementCollection = ({ array, isCompleted }) => {
    const collection = array
      .filter((item) => item.isCompleted === isCompleted)
      .sort((itemA, itemB) => itemA.orderId - itemB.orderId)
      .map((item) => itemElement(item));

    return collection;
  };

  const items = elementCollection({ array: props.items, isCompleted: false });
  const completed = elementCollection({
    array: props.items,
    isCompleted: true,
  });

  return (
    <ul className={styles.ItemList}>
      {items}
      <Item
        key="addListItem"
        text=""
        isCompleted={false}
        isOpen={false}
        onInputFocus={props.onAddItemClick}
      ></Item>
      {completed}
    </ul>
  );
}

export default ItemList;
