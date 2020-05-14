import React from "react";
import Item from "./Item";
import styles from "./ItemList.module.css";

const TIMEOUT_MS = 500;
let timeoutId;

function move(array, prevIndex, nextIndex) {
  const arrayCopy = [...array];
  const item = arrayCopy.splice(prevIndex, 1)[0];
  arrayCopy.splice(nextIndex, 0, item);
  return arrayCopy;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function calculateIndex(localCoordinateY, itemHeight, maxIndex) {
  const index = Math.round(localCoordinateY / itemHeight);
  return clamp(index, 0, maxIndex);
}

function getTopRelativeToParent(
  cursorPageY,
  parentTopEdgeY,
  elementTopEdgeOffsetY
) {
  return cursorPageY - parentTopEdgeY - elementTopEdgeOffsetY;
}

function getCoords(element) {
  const rect = element.getBoundingClientRect();
  const scrollY = window.scrollY;

  return {
    top: rect.top + scrollY,
    height: rect.height,
  };
}

class ItemList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isDragging: false,
      dragItemId: null,
      dragItemHeight: null,
      dragItemTop: null,
      dragItemTopEdgeOffsetY: null,
      dragItemRelativeOffsetTop: null,
    };

    this.listRef = React.createRef();
    this.itemRefs = {};
    console.log("ItemList constructor");

    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
    this.handlePointerCancel = this.handlePointerCancel.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
  }

  reorderItems(items, currentIndex, newIndex) {
    const reorderedItems = move(items, currentIndex, newIndex);
    let maxOrderId = null;

    return reorderedItems.map((item) => {
      if (maxOrderId === null) {
        maxOrderId = item.orderId;
      } else if (maxOrderId >= item.orderId) {
        maxOrderId += 1;
      } else {
        maxOrderId = item.orderId;
      }

      return { ...item, orderId: maxOrderId };
    });
  }

  startDrag({ itemId, offsetY, height, top, itemIndex }) {
    console.log("startDrag");
    this.setState({
      isDragging: true,
      dragItemId: itemId,
      dragItemHeight: height,
      dragItemTop: top,
      dragItemTopEdgeOffsetY: offsetY,
      dragItemIndex: itemIndex,
    });
  }

  stopDrag() {
    console.log("stopDrag");
    this.setState({
      isDragging: false,
      dragItemId: null,
      dragItemHeight: null,
      dragItemTop: null,
      dragItemTopEdgeOffsetY: null,
      dragItemIndex: null,
      dragItemRelativeOffsetTop: null,
    });
  }

  handlePointerDown(e, itemId, itemIndex, text) {
    console.log(`handlePointerDown ${e.timeStamp}`, text);
    const offsetY = e.nativeEvent.offsetY;
    const { height, top } = getCoords(e.target);
    const args = {
      itemId,
      itemIndex,
      height,
      top,
      offsetY,
    };
    timeoutId = setTimeout(this.startDrag.bind(this, args), TIMEOUT_MS);
  }

  handlePointerUp(e) {
    clearTimeout(timeoutId);

    if (this.state.isDragging) {
      this.stopDrag();
    }
  }

  handlePointerCancel(e) {
    clearTimeout(timeoutId);

    if (this.state.isDragging) {
      this.stopDrag();
    }
  }

  handlePointerMove(e) {
    if (!this.state.isDragging) {
      return;
    }
    const {
      dragItemTopEdgeOffsetY,
      dragItemHeight,
      dragItemTop,
      dragItemIndex,
    } = this.state;
    const listElement = this.listRef.current;
    const { top: listTop } = getCoords(listElement);

    const itemTopRelativeToParent = getTopRelativeToParent(
      e.pageY,
      listTop,
      dragItemTopEdgeOffsetY
    );
    const newIndex = calculateIndex(
      itemTopRelativeToParent,
      dragItemHeight,
      this.props.items.length - 1
    );

    if (newIndex === dragItemIndex) {
      const dragItemRelativeOffsetTop =
        e.pageY - dragItemTop - dragItemTopEdgeOffsetY;

      this.setState({
        dragItemRelativeOffsetTop,
      });
    } else {
      // console.log(`index ${dragItemIndex} → ${newIndex}`);
      const newDragItemTop = newIndex * dragItemHeight + listTop;
      const dragItemRelativeOffsetTop =
        e.pageY - newDragItemTop - dragItemTopEdgeOffsetY;

      const reorderedItems = this.reorderItems(
        this.props.items,
        dragItemIndex,
        newIndex
      );

      const orderIdObject = reorderedItems.reduce((result, item) => {
        return { ...result, [item.id]: item.orderId };
      }, {});

      this.props.onOrderChange(orderIdObject);

      this.setState({
        dragItemRelativeOffsetTop,
        dragItemTop: newDragItemTop,
        dragItemIndex: newIndex,
      });
    }
  }

  getBoundingRects(items) {
    return items.reduce((boundingRects, item) => {
      const domNode = this.itemRefs[item.id].current;
      const boundingRect = domNode.getBoundingClientRect();
      return { ...boundingRects, [item.id]: boundingRect };
    }, {});
  }

  didItemOrderChange(itemsA, itemsB) {
    for (let i = 0; i < itemsA.length; i += 1) {
      const itemA = itemsA[i];
      const itemB = itemsB.find((item) => item.id === itemA.id);
      if (itemB && itemA.orderId !== itemB.orderId) {
        return true;
      }
    }

    return false;
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    const orderChanged = this.didItemOrderChange(
      prevProps.items,
      this.props.items
    );

    if (orderChanged) {
      return this.getBoundingRects(prevProps.items);
    } else {
      return null;
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (!snapshot) {
      return;
    }

    const prevRects = snapshot;
    const nextRects = this.getBoundingRects(this.props.items);
    for (let i = 0; i < this.props.items.length; i += 1) {
      const item = this.props.items[i];
      const domNode = this.itemRefs[item.id].current;
      const nextRect = nextRects[item.id];
      const prevRect = prevRects[item.id];

      if (!prevRect) {
        continue;
      }

      const deltaY = prevRect.top - nextRect.top;
      requestAnimationFrame(() => {
        domNode.style.transform = `translate(0, ${deltaY}px)`;
        domNode.style.transition = "transform 0s";
        requestAnimationFrame(() => {
          domNode.style.transform = "";
          domNode.style.transition = "transform 500ms";
        });
      });
    }
  }

  getItemElement(item, index) {
    this.itemRefs[item.id] = this.itemRefs[item.id] || React.createRef();

    const itemStyle =
      item.id === this.state.dragItemId
        ? { top: `${this.state.dragItemRelativeOffsetTop}px` }
        : {};

    return (
      <Item
        key={item.id}
        ref={this.itemRefs[item.id]}
        text={item.text}
        isCompleted={item.isCompleted}
        isBeingDragged={item.id === this.state.dragItemId}
        itemStyle={itemStyle}
        onValueChange={this.props.onValueChange}
        onCheckClick={this.props.onCheckClick}
        onInputEnter={this.props.onInputEnter}
        id={item.id}
        index={index}
        isOpen={item.isOpen}
        onBlur={this.props.onBlur}
        orderId={item.orderId}
        onDeleteClick={this.props.onDeleteClick}
        hasCheckButton={true}
        onPointerDown={this.handlePointerDown}
      ></Item>
    );
  }

  getElementCollection({ items }) {
    return items.map((item, index) => this.getItemElement(item, index));
  }

  render() {
    const itemElements = this.getElementCollection({
      items: this.props.items,
    });
    const completedElements = this.getElementCollection({
      items: this.props.completedItems,
    });

    return (
      <ul
        ref={this.listRef}
        className={styles.ItemList}
        onPointerUp={this.handlePointerUp}
        onPointerCancel={this.handlePointerCancel}
        onPointerMove={this.handlePointerMove}
      >
        {itemElements}
        {this.props.showCompleted ? completedElements : null}
      </ul>
    );
  }
}

export default ItemList;
