import React from "react";
import Item from "./Item";
import styles from "./ItemList.module.css";
import { logEvent } from "./utilities";

class ItemList extends React.Component {
  constructor(props) {
    super(props);

    this.handlePointerUp = this.handlePointerUp.bind(this);
    this.handlePointerCancel = this.handlePointerCancel.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
  }

  handlePointerUp(e) {
    this.props.onPointerUp();
    logEvent(e);
  }

  handlePointerCancel(e) {
    this.props.onPointerCancel();
    logEvent(e);
  }

  handlePointerMove(e) {
    const pageY = e.pageY;
    this.props.onPointerMove({
      pageY,
      target: e.target,
      currentTarget: e.currentTarget,
      e,
    });
  }

  getItemElement(item, index) {
    return (
      <Item
        style={{
          top: `${index * 56}px`,
        }}
        key={item.id}
        text={item.text}
        isCompleted={item.isCompleted}
        isBeingDragged={item.isBeingDragged}
        onValueChange={this.props.onValueChange}
        onCheckClick={this.props.onCheckClick}
        onInputEnter={this.props.onInputEnter}
        id={item.id}
        isOpen={item.isOpen}
        onBlur={this.props.onBlur}
        orderId={item.orderId}
        onDeleteClick={this.props.onDeleteClick}
        hasCheckButton={true}
        onPointerDown={this.props.onPointerDown}
      ></Item>
    );
  }

  getElementCollection({ array, isCompleted }) {
    const collection = array
      .filter((item) => item.isCompleted === isCompleted)
      .sort((itemA, itemB) => itemA.orderId - itemB.orderId)
      .map((item, index) => this.getItemElement(item, index));

    return collection;
  }

  render() {
    const items = this.getElementCollection({
      array: this.props.items,
      isCompleted: false,
    });
    const completed = this.getElementCollection({
      array: this.props.items,
      isCompleted: true,
    });

    return (
      <ul
        className={styles.ItemList}
        onPointerUp={this.handlePointerUp}
        onPointerCancel={this.handlePointerCancel}
        onPointerMove={this.handlePointerMove}
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
        {this.props.showCompleted ? completed : null}
      </ul>
    );
  }
}

export default ItemList;
