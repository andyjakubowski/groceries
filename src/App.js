import React from 'react';
import './App.css';
import Header from './Header';
import OnLineStatusBanner from './OnLineStatusBanner';
import ItemList from './ItemList';
import Toolbar from './Toolbar';
import { v4 as uuid } from 'uuid';
import * as client from './client';
import { has } from './utilities';

const defaultState = {
  items: [],
  showCompleted: true,
  onLineStatus: navigator.onLine ? 'online' : 'offline',
};

const LOCAL_STORAGE_KEY = 'groceries';
const getLocalStorageState = function getLocalStorageState() {
  const state = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY));

  return state || {};
};

const getInitialState = () => {
  return Object.assign({}, defaultState, getLocalStorageState());
};

const saveData = (data) =>
  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = getInitialState();

    this.handleConnected = this.handleConnected.bind(this);
    this.handleDisconnected = this.handleDisconnected.bind(this);
    this.handleReceived = this.handleReceived.bind(this);
    this.handleAddItemClick = this.handleAddItemClick.bind(this);
    this.handleDeleteItemClick = this.handleDeleteItemClick.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.handleCheckClick = this.handleCheckClick.bind(this);
    this.handleItemBlur = this.handleItemBlur.bind(this);
    this.handleInputEnter = this.handleInputEnter.bind(this);
    this.handleReloadClick = this.handleReloadClick.bind(this);
    this.handleCompletedToggle = this.handleCompletedToggle.bind(this);
    this.handleOrderChange = this.handleOrderChange.bind(this);
  }

  componentDidMount() {
    client.subscribeToUpdates({
      onConnected: this.handleConnected,
      onDisconnected: this.handleDisconnected,
      onReceived: this.handleReceived,
    });
  }

  componentDidUpdate() {
    saveData(this.state);
  }

  loadItems() {
    client.getItems((items) => {
      this.setState({ items });
    });
  }

  handleConnected() {
    console.log('Connected to Action Cable WebSocket.');
    this.loadItems();
    this.setState({
      onLineStatus: 'online',
    });
  }

  handleDisconnected() {
    console.log('Disconnected from Action Cable WebSocket.');
    this.setState({
      onLineStatus: 'tryingToConnect',
    });
  }

  hasItem(items, id) {
    for (let i = 0; i < items.length; i += 1) {
      if (items[i].id === id) {
        return true;
      }
    }

    return false;
  }

  handleReceived(data) {
    // Ignore received data if the change originated with this client
    if (data.clientId === client.id) {
      return;
    }

    switch (data.message_type) {
      case 'item_create':
        if (!this.hasItem(this.state.items, data.item.id)) {
          this.createItem(data.item);
        }
        break;
      case 'item_update':
        this.updateItem(data.item);
        break;
      case 'item_delete':
        this.deleteItem(data.item.id);
        break;
      default:
        console.log('Unrecognized message type');
    }
  }

  createItem({
    id = uuid(),
    orderId,
    text = '',
    isCompleted = false,
    isOpen = false,
  }) {
    const newItem = {
      id,
      orderId,
      text,
      isCompleted,
      isOpen,
    };

    this.setState({
      items: this.state.items
        .map((item) => {
          if (item.orderId >= newItem.orderId) {
            return Object.assign({}, item, {
              orderId: item.orderId + 1,
            });
          } else {
            return item;
          }
        })
        .concat(newItem),
    });

    return newItem;
  }

  updateItem(updatedItem) {
    this.setState({
      items: this.state.items.map((item) => {
        if (item.id === updatedItem.id) {
          return Object.assign({}, item, updatedItem);
        } else {
          return item;
        }
      }),
    });
  }

  deleteItem(id) {
    this.setState({
      items: this.state.items.filter((item) => item.id !== id),
    });
  }

  handleAddItemClick() {
    const orderIds = this.state.items
      .filter((item) => !item.isCompleted)
      .map((item) => item.orderId);

    let orderId;

    if (orderIds.length > 0) {
      orderId = Math.max(...orderIds) + 1;
    } else {
      orderId = 0;
    }

    const item = this.createItem({ orderId, isOpen: true });
    client.createItem(item);
  }

  handleInputEnter({ orderId }) {
    const newItemOrderId = orderId + 1;
    const item = this.createItem({ orderId: newItemOrderId, isOpen: true });

    client.createItem(item);
  }

  handleDeleteItemClick({ id }) {
    this.deleteItem(id);
    client.deleteItem(id);
  }

  handleItemBlur({ id }) {
    this.setState({
      items: this.state.items.map((item) => {
        if (item.id === id) {
          const updated = Object.assign({}, item, {
            isOpen: false,
          });
          return updated;
        } else {
          return item;
        }
      }),
    });
  }

  handleValueChange({ id, text }) {
    this.setState({
      items: this.state.items.map((item) => {
        if (item.id === id) {
          const updated = Object.assign({}, item, {
            text,
          });
          client.updateItem(updated);
          return updated;
        } else {
          return item;
        }
      }),
    });
  }

  handleCheckClick({ id, isCompleted }) {
    const orderIds = this.state.items
      .filter((item) => item.isCompleted === !isCompleted)
      .map((item) => item.orderId);
    let orderId;

    if (orderIds.length > 0) {
      orderId = isCompleted
        ? Math.max(...orderIds) + 1
        : Math.min(...orderIds) - 1;
    } else {
      orderId = 0;
    }

    this.setState({
      items: this.state.items.map((item) => {
        if (item.id === id) {
          const updated = Object.assign({}, item, {
            isCompleted: !item.isCompleted,
            orderId,
          });
          client.updateItem(updated);
          return updated;
        } else {
          return item;
        }
      }),
    });
  }

  handleReloadClick() {
    this.loadItems();
  }

  handleCompletedToggle() {
    this.setState((prevState) => {
      if (has(prevState, 'showCompleted')) {
        return { showCompleted: !prevState.showCompleted };
      } else {
        return { showCompleted: false };
      }
    });
  }

  handleOrderChange(orderIdObject) {
    const updatedItems = [];
    this.setState({
      items: this.state.items.map((item) => {
        if (has(orderIdObject, item.id)) {
          const updated = { ...item, orderId: orderIdObject[item.id] };
          updatedItems.push(updated);
          return updated;
        } else {
          return item;
        }
      }),
    });
    client.updateManyItems(updatedItems);
  }

  render() {
    const title = 'Linda v21';
    const showCompleted = has(this.state, 'showCompleted')
      ? this.state.showCompleted
      : true;
    const notCompletedItems = this.state.items
      .filter((item) => !item.isCompleted)
      .sort((itemA, itemB) => itemA.orderId - itemB.orderId);
    const completedItems = this.state.items
      .filter((item) => item.isCompleted)
      .sort((itemA, itemB) => itemA.orderId - itemB.orderId);

    return (
      <div className="App">
        <Header onReloadClick={this.handleReloadClick} title={title} />
        <OnLineStatusBanner status={this.state.onLineStatus} />
        <ItemList
          items={notCompletedItems}
          completedItems={completedItems}
          onValueChange={this.handleValueChange}
          onOrderChange={this.handleOrderChange}
          onCheckClick={this.handleCheckClick}
          onBlur={this.handleItemBlur}
          onInputEnter={this.handleInputEnter}
          onAddItemClick={this.handleAddItemClick}
          onDeleteClick={this.handleDeleteItemClick}
          showCompleted={showCompleted}
        />
        <Toolbar
          onAddItemClick={this.handleAddItemClick}
          onCompletedToggle={this.handleCompletedToggle}
        />
      </div>
    );
  }
}

export default App;
