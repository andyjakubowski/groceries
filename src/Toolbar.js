import React from "react";
import ToolbarButton from "./ToolbarButton";
import styles from "./Toolbar.module.css";

function Toolbar(props) {
  return (
    <div className={styles.Toolbar}>
      <ToolbarButton onClick={props.onAddItemClick}>Add item</ToolbarButton>
      <ToolbarButton onClick={props.onCompletedToggle}>
        Toggle completed
      </ToolbarButton>
    </div>
  );
}

export default Toolbar;
