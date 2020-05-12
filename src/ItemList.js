import React from "react";
import Item from "./Item";
import styles from "./ItemList.module.css";
import { logEvent } from "./utilities";

function ItemList(props) {
  const handlePointerUp = (e) => {
    props.onPointerUp();
    logEvent(e);
  };

  const handlePointerCancel = (e) => {
    props.onPointerCancel();
    logEvent(e);
  };

  const handlePointerMove = (e) => {
    props.onPointerMove();
    // logEvent(e);
  };

  const itemElement = (item) => (
    <Item
      key={item.id}
      text={item.text}
      isCompleted={item.isCompleted}
      isBeingDragged={item.isBeingDragged}
      onValueChange={props.onValueChange}
      onCheckClick={props.onCheckClick}
      onInputEnter={props.onInputEnter}
      id={item.id}
      isOpen={item.isOpen}
      onBlur={props.onBlur}
      orderId={item.orderId}
      onDeleteClick={props.onDeleteClick}
      hasCheckButton={true}
      onPointerDown={props.onPointerDown}
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
    <ul
      className={styles.ItemList}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerMove={handlePointerMove}
    >
      {items}
      {/* <Item
        key="addListItem"
        text=""
        isCompleted={false}
        isOpen={false}
        onInputFocus={props.onAddItemClick}
        hasCircle={false}
      ></Item> */}
      {props.showCompleted ? completed : null}
    </ul>
  );
}

export default ItemList;
