import React from 'react';
import Item from './Item';
import styles from './ItemList.module.css';

const TIMEOUT_MS = 500;
let timeoutId;

function move(array, prevIndex, nextIndex) {
  const arrayCopy = [...array];

  if (prevIndex > array.length - 1) {
    console.clear();
    console.warn(`move(): No item to move at index ${prevIndex} in array:`);
    console.table(array);
    return arrayCopy;
  }

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

function getElementTop(domNode) {
  const { top: elementTop } = getCoords(domNode);
  return elementTop;
}

class ItemList extends React.Component {
  static getDerivedStateFromProps(props, state) {
    const draggedItem = props.items.find(
      (item) => item.id === state.dragItemId
    );
    if (!draggedItem) {
      return null;
    }

    const dragItemIndex = props.items.indexOf(draggedItem);
    const listTop = getElementTop(state.listRef.current);
    const dragItemTop = dragItemIndex * state.dragItemHeight + listTop;
    const dragItemRelativeOffsetTop =
      state.dragPointerPageY - dragItemTop - state.dragItemTopEdgeOffsetY;
    return { dragItemIndex, dragItemTop, dragItemRelativeOffsetTop };
  }

  constructor(props) {
    super(props);

    this.state = {
      isDragging: false,
      dragItemId: null,
      dragItemHeight: null,
      dragItemTop: null,
      dragItemTopEdgeOffsetY: null,
      dragItemIndex: null,
      dragItemRelativeOffsetTop: null,
      dragPointerPageY: null,
      listRef: React.createRef(),
    };

    // this.listRef = React.createRef();
    this.itemRefs = {};

    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
    this.handlePointerCancel = this.handlePointerCancel.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
  }

  componentDidMount() {
    // console.log("ItemList: componentDidMount");
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

  startDrag({ itemId, offsetY, pageY, height, top, itemIndex }) {
    // console.log('startDrag');
    this.setState({
      isDragging: true,
      dragItemId: itemId,
      dragItemHeight: height,
      dragItemTop: top,
      dragItemTopEdgeOffsetY: offsetY,
      dragItemIndex: itemIndex,
      dragPointerPageY: pageY,
    });
  }

  stopDrag() {
    // console.log('stopDrag');
    this.setState({
      isDragging: false,
      dragItemId: null,
      dragItemHeight: null,
      dragItemTop: null,
      dragItemTopEdgeOffsetY: null,
      dragItemIndex: null,
      dragItemRelativeOffsetTop: null,
      dragPointerPageY: null,
    });
  }

  handlePointerDown(e, itemId, itemIndex, text) {
    // console.log("handlePointerDown", text);
    const pageY = e.pageY;
    const { height, top } = getCoords(e.currentTarget);
    const offsetY = pageY - top;
    const args = {
      itemId,
      itemIndex,
      height,
      top,
      offsetY,
      pageY,
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

    const listElement = this.state.listRef.current;
    const listTop = getElementTop(listElement);
    const dragPointerPageY = e.pageY;

    const itemTopRelativeToParent = getTopRelativeToParent(
      dragPointerPageY,
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
        dragPointerPageY - dragItemTop - dragItemTopEdgeOffsetY;

      this.setState({
        dragItemRelativeOffsetTop,
        dragPointerPageY,
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
        dragPointerPageY,
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
    // console.log("ItemList: componentDidUpdate");
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
        domNode.style.transition = 'transform 0s';
        requestAnimationFrame(() => {
          domNode.style.transform = '';
          domNode.style.transition = 'transform 300ms';
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
        ref={this.state.listRef}
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
