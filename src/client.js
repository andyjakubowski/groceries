import { createConsumer } from '@rails/actioncable';
import { v4 as uuid } from 'uuid';
import localforage from 'localforage';
import throttle from 'lodash/throttle';
import { has } from './utilities';

const isHttps =
  process.env.NODE_ENV === 'production' ||
  process.env.REACT_APP_HTTPS === 'true';
const HOST =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_API_HOST_PRODUCTION
    : isHttps
    ? process.env.REACT_APP_API_HOST_DEVELOPMENT_HTTPS
    : process.env.REACT_APP_API_HOST_DEVELOPMENT;
const API_URL = isHttps ? `https://${HOST}` : `http://${HOST}`;
const CABLE_URL = isHttps ? `wss://${HOST}/cable` : `ws://${HOST}/cable`;
const HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};
const REQUEST_THROTTLE_MS = 1000;
const consumer = createConsumer(CABLE_URL);
export const id = uuid();
let actionCableStatus = 'disconnected';

export function subscribeToUpdates({
  onConnected,
  onDisconnected,
  onReceived,
}) {
  consumer.subscriptions.create(
    {
      channel: 'ListChannel',
    },
    {
      connected() {
        actionCableStatus = 'connected';
        onConnected();
      },

      disconnected() {
        actionCableStatus = 'disconnected';
        onDisconnected();
      },

      received(data) {
        onReceived(data);
      },
    }
  );
}

export function getItems(success) {
  if (actionCableStatus === 'disconnected') {
    console.log('AC disconnected, ignoring getItems request.');
  } else {
    // Flush offline request queue before fetching items
    flushQueue().then(() =>
      fetch(`${API_URL}/items`, {
        headers: HEADERS,
      })
        .then(parseJSON)
        .then(success)
    );
  }
}

export function createItem(item) {
  const data = Object.assign({}, item, { clientId: id });
  const request = new Request(`${API_URL}/items`, {
    method: 'post',
    headers: HEADERS,
    body: JSON.stringify(data),
  });
  fetchOrEnqueue(request);
}

export function updateItem(item) {
  const data = Object.assign({}, item, { clientId: id });
  const request = new Request(`${API_URL}/items/${item.id}`, {
    method: 'put',
    headers: HEADERS,
    body: JSON.stringify(data),
  });
  getThrottledFetchOrEnqueue(item.id)(request);
}

export function updateManyItems(items) {
  const data = { items, clientId: id };
  const request = new Request(`${API_URL}/items/update_many`, {
    method: 'put',
    headers: HEADERS,
    body: JSON.stringify(data),
  });
  fetchOrEnqueue(request);
}

export function deleteItem(id) {
  const data = { clientId: id };
  const request = new Request(`${API_URL}/items/${id}`, {
    method: 'delete',
    headers: HEADERS,
    body: JSON.stringify(data),
  });
  fetchOrEnqueue(request);
}

function parseJSON(response) {
  return response.json();
}

function fetchOrEnqueue(request) {
  if (actionCableStatus === 'disconnected') {
    console.log('AC disconnected, enqueueing request.');
    enqueue(request);
  } else {
    fetch(request);
  }
}

const getThrottledFetchOrEnqueue = (function makeGetThrottledFetchOrEnqueue() {
  const throttledFunctions = {};

  return function getThrottledFetchOrEnqueue(itemId) {
    const itemIdString = String(itemId);

    if (has(throttledFunctions, itemIdString)) {
      return throttledFunctions[itemIdString];
    } else {
      const newThrottledFunction = throttle(
        fetchOrEnqueue,
        REQUEST_THROTTLE_MS
      );
      throttledFunctions[itemIdString] = newThrottledFunction;
      return newThrottledFunction;
    }
  };
})();

// By using Mozilla's localforage db wrapper, we can count on
// a fast setup for a versatile key-value database. We use
// it to store queue of deferred requests.

// Enqueue consists of adding a request to the list. Due to the
// limitations of IndexedDB, Request and Response objects can not
// be saved so we need an alternative representations. This is
// why we call to `serialize()`.`
function enqueue(request) {
  return serialize(request).then(function (serialized) {
    localforage.getItem('queue').then(function (queue) {
      /* eslint no-param-reassign: 0 */
      queue = queue || [];
      queue.push(serialized);
      return localforage.setItem('queue', queue).then(function () {
        console.log(serialized.method, serialized.url, 'enqueued!');
      });
    });
  });
}

// Flush is a little more complicated. It consists of getting
// the elements of the queue in order and sending each one,
// keeping track of not yet sent request. Before sending a request
// we need to recreate it from the alternative representation
// stored in IndexedDB.
function flushQueue() {
  // Get the queue
  return localforage.getItem('queue').then(function (queue) {
    /* eslint no-param-reassign: 0 */
    queue = queue || [];
    console.log('Flushing queue: ', queue);

    // If empty, nothing to do!
    if (!queue.length) {
      return Promise.resolve();
    }

    // Else, send the requests in order...
    // console.log('Sending ', queue.length, ' requests...');
    return sendInOrder(queue).then(function () {
      // **Requires error handling**. Actually, this is assuming all the requests
      // in queue are a success when reaching the Network. So it should empty the
      // queue step by step, only popping from the queue if the request completes
      // with success.
      return localforage.setItem('queue', []);
    });
  });
}

// Send the requests inside the queue in order. Waiting for the current before
// sending the next one.
function sendInOrder(requests) {
  // The `reduce()` chains one promise per serialized request, not allowing to
  // progress to the next one until completing the current.
  var sending = requests.reduce(function (prevPromise, serialized) {
    // console.log('Sending', serialized.method, serialized.url);
    return prevPromise.then(function () {
      return deserialize(serialized).then(function (request) {
        return fetch(request);
      });
    });
  }, Promise.resolve());
  return sending;
}

// Serialize is a little bit convolved due to headers is not a simple object.
function serialize(request) {
  var headers = {};
  // `for(... of ...)` is ES6 notation but current browsers supporting SW, support this
  // notation as well and this is the only way of retrieving all the headers.
  for (var entry of request.headers.entries()) {
    headers[entry[0]] = entry[1];
  }
  var serialized = {
    url: request.url,
    headers: headers,
    method: request.method,
    mode: request.mode,
    credentials: request.credentials,
    cache: request.cache,
    redirect: request.redirect,
    referrer: request.referrer,
  };

  // Only if method is not `GET` or `HEAD` is the request allowed to have body.
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return request
      .clone()
      .text()
      .then(function (body) {
        serialized.body = body;
        return Promise.resolve(serialized);
      });
  }
  return Promise.resolve(serialized);
}

// Compared, deserialize is pretty simple.
function deserialize(data) {
  return Promise.resolve(new Request(data.url, data));
}
