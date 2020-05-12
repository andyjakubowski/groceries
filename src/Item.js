import React from "react";
import styles from "./Item.module.css";
import { ReactComponent as Checked } from "./checked.svg";
import { ReactComponent as Unchecked } from "./unchecked.svg";
import { ReactComponent as Delete } from "./delete.svg";
import { logEvent } from "./utilities";

function Item(props) {
  const handleValueChange = (e) => {
    if (props.onValueChange) {
      props.onValueChange({
        id: props.id,
        text: e.target.value,
      });
    }
  };

  const handleCheckClick = (e) => {
    if (props.onCheckClick) {
      props.onCheckClick({
        id: props.id,
        isCompleted: props.isCompleted,
      });
    }
  };

  const handleDeleteClick = (e) => {
    if (props.onDeleteClick) {
      props.onDeleteClick({
        id: props.id,
      });
    }
  };

  const handleInputFocus = () => {
    if (props.onInputFocus) {
      props.onInputFocus();
    }
  };

  const handleInputBlur = () => {
    if (props.onBlur) {
      props.onBlur({ id: props.id });
    }
  };

  const handleKeyUp = (e) => {
    if (e.key === "Enter") {
      props.onInputEnter({ orderId: props.orderId });
    }
  };

  const handlePointerDown = (e) => {
    const offsetY = e.nativeEvent.offsetY;
    props.onPointerDown({ id: props.id, offsetY });
    logEvent(e);
  };

  const deleteButton = props.onDeleteClick ? (
    <button className={styles.DeleteButton} onClick={handleDeleteClick}>
      <Delete className={styles.DeleteIcon} />
    </button>
  ) : null;
  const checkButton = props.hasCheckButton ? (
    <button className={styles.CheckBox} onClick={handleCheckClick}>
      {props.isCompleted ? (
        <Checked className={styles.Checked} />
      ) : (
        <Unchecked className={styles.Unchecked} />
      )}
    </button>
  ) : null;
  const itemClassName = function getItemClassName() {
    let className = "";

    if (props.isCompleted) {
      className = styles.ItemCompleted;
    } else {
      className = styles.Item;
    }

    if (props.isBeingDragged) {
      className = `${className} ${styles.Dragged}`;
    }

    return className;
  };

  const fieldClassName = props.isCompleted
    ? styles.textCompleted
    : styles.field;

  return (
    <li className={itemClassName()} onPointerDown={handlePointerDown}>
      {checkButton}
      <input
        className={fieldClassName}
        type="text"
        value={props.text}
        onChange={handleValueChange}
        disabled={props.isCompleted ? true : false}
        autoFocus={props.isOpen}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onKeyUp={handleKeyUp}
      ></input>
      {deleteButton}
    </li>
  );
}

export default Item;
