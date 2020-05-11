import React from "react";
import styles from "./ToolbarButton.module.css";

function ToolbarButton(props) {
  return (
    <button className={styles.Button} onClick={props.onClick}>
      {props.children}
    </button>
  );
}

export default ToolbarButton;
