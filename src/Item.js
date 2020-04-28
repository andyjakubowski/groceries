import React from "react";
import styles from "./Item.module.css";
import { ReactComponent as Checked } from "./checked.svg";
import { ReactComponent as Unchecked } from "./unchecked.svg";

function Item(props) {
  const itemClassName = props.isCompleted ? styles.ItemCompleted : styles.Item;
  const checkBoxClassName = props.isCompleted
    ? styles.checkBoxCompleted
    : styles.checkBox;
  const fieldClassName = props.isCompleted
    ? styles.textCompleted
    : styles.field;

  return (
    <li className={itemClassName}>
      <button className={styles.button}>
        {props.isCompleted ? (
          <Checked className={styles.Checked} />
        ) : (
          <Unchecked className={styles.Unchecked} />
        )}
      </button>
      <input
        className={fieldClassName}
        type="text"
        value={props.text}
        onChange={props.onChange}
        disabled={props.isCompleted ? true : false}
      ></input>
    </li>
  );
}

export default Item;
