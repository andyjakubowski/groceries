import React from "react";
import styles from "./Item.module.css";

function Item(props) {
  const buttonClassName = props.isCompleted
    ? styles.buttonCompleted
    : styles.button;

  return (
    <li>
      <button className={buttonClassName}></button>
      <input type="text" value={props.text} onChange={props.onChange}></input>
    </li>
  );
}

export default Item;
