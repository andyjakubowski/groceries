import React from "react";

function AddItemListItem(props) {
  const handleClick = (e) => {
    props.onAddItemClick();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const handleKeyUp = (e) => {
    if (e.key === "Enter") {
      props.onAddItemClick();
    }
  };

  return (
    <li>
      <button
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
      >
        {props.children}
      </button>
    </li>
  );
}

export default AddItemListItem;
