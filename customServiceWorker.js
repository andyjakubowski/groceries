importScripts("/groceries/precache-manifest.933a0069513eba6adfad92956c14d0bc.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

console.log('👋👋 Hello from customServiceWorker.js!');

/* eslint-env es6 */
/* eslint no-unused-vars: 0 */
/* global importScripts, ServiceWorkerWare, localforage */
// This line imports "ServiceWorkerWare", "StaticCacher", "SimpleOfflineCache" to this context
importScripts('./lib/ServiceWorkerWare.js');

// This line imports "localforage" to this context
importScripts('./lib/localforage.js');

// This file resides in /public, so I don’t have access to process.env.NODE_ENV
// I test my production build locally on localhost, so I need a way to
// target the production Action Cable server from "production localhost"
const localhostProductionPort = 3010;
const isLocalhost = Boolean(
  self.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    self.location.hostname === '[::1]' ||
    // 127.0.0.0/8 are considered localhost for IPv4.
    self.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);

// Determine the api root URL
const apiRoot = (function setApiRoot() {
  if (isLocalhost && location.port == localhostProductionPort) {
    return 'https://linda-groceries.herokuapp.com';
  } else if (isLocalhost && location.port != localhostProductionPort) {
    return 'http://192.168.2.102:9000';
  } else if (!isLocalhost) {
    return 'https://linda-groceries.herokuapp.com';
  }
})();

// By using Mozilla's ServiceWorkerWare we can quickly setup some routes
// for a _virtual server_. **It is convenient you review the
// [virtual server recipe](/virtual-server.html) before seeing this**.
// Object.keys(worker) =
// ["middleware", "router", "get", "post", "put", "delete", "head",
// "all", "fallbackMw", "autoClaim"]
// var worker = new ServiceWorkerWare({ autoClaim: false });
var worker = new ServiceWorkerWare();

// So here is the idea. We will check if we are online or not. In case
// we are not online, enqueue the request and provide a fake response.
// Else, flush the queue and let the new request to reach the network.
// This function factory does exactly that.
function tryOrFallback(fakeResponse) {
  // console.count('tryOrFallback');
  // Return a handler that...
  return function (req, res) {
    // If offline, enqueue and answer with the fake response.
    if (!navigator.onLine) {
      console.log('No network availability, enqueuing');
      return enqueue(req).then(function () {
        // As the fake response will be reused but Response objects
        // are one use only, we need to clone it each time we use it.
        console.log('enqueue.then running, returning fakeResponse.clone()');
        return fakeResponse.clone();
      });
    }

    // If online, flush the queue and answer from network.
    console.log('Network available! Flushing queue.');
    return flushQueue().then(function () {
      console.log('flushQueue finished.');
      return fetch(req);
    });
  };
}

// The function returned by tryOrFallback is the handler
worker.put(
  apiRoot + '/items/:id',
  tryOrFallback(
    new Response(null, {
      status: 202,
    })
  )
);

worker.put(
  apiRoot + '/items/update_many',
  tryOrFallback(
    new Response(null, {
      status: 202,
    })
  )
);

// Creation is another story. We can not reach the server so we can not
// get the id for the new quotations. No problem, just say we accept the
// creation and we will process it later, as soon as we recover connectivity.
worker.post(
  apiRoot + '/items',
  tryOrFallback(
    new Response(null, {
      status: 202,
    })
  )
);

// For deletion, let's simulate that all went OK. **Notice we are omitting
// the body of the response**. Trying to add a body with a 204, deleted, as
// status throws an error.
worker.delete(
  apiRoot + '/items/:id',
  tryOrFallback(
    new Response(null, {
      status: 204,
    })
  )
);

worker.get(
  apiRoot + '/items',
  tryOrFallback(
    new Response(null, {
      status: 400,
    })
  )
);

// Start the service worker.
worker.init();

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

    console.log('Queue', queue);

    // If empty, nothing to do!
    if (!queue.length) {
      return Promise.resolve();
    }

    // Else, send the requests in order...
    console.log('Sending ', queue.length, ' requests...');
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
    console.log('Sending', serialized.method, serialized.url);
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

