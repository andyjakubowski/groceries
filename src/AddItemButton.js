import React from "react";
import styles from "./AddItemButton.module.css";

function AddItemButton(props) {
  return (
    <button className={styles.Button} onClick={props.onClick}>
      Add item
    </button>
  );
}

export default AddItemButton;
