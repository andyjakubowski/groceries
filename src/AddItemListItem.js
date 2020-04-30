import React from "react";

function AddItemListItem(props) {
  return (
    <li>
      <button onClick={props.onAddItemClick}>{props.children}</button>
    </li>
  );
}

export default AddItemListItem;
