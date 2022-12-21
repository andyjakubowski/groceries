# Linda Groceries

A real time, offline-capable grocery list built in React using [Create React App](https://github.com/facebook/create-react-app).

Backed by [`groceries_api`](https://github.com/andyjakubowski/groceries_api), an API-only Rails app. `groceries_api` uses Postgres for persistence and Redis to enable the real time syncing of grocery list items.

## How it Works

- Online status is derived based on whether the Groceries API WebSocket connection remains open. If we stop hearing from the Groceries API, we’ll indicate in the UI that there’s no connection.
- Offline functionality is implemented with a queue. When write request to the Groceries API doesn’t succeed because the device is offline, it gets added to the queue. When the device reconnects, the queue gets flushed _First In, First Out_.
- Any changes you make while offline are stored in the browser’s Local Storage.

## Installation and Usage

Make sure to install and run [`groceries_api`](https://github.com/andyjakubowski/groceries_api) first, otherwise this client app won’t have any data to work with!

- Install project dependencies:

```shell
yarn install
```

- Start the development server:

```shell
yarn start
```

## Deploying to GitHub Pages

Deploying to [GitHub Pages](https://pages.github.com) is the easiest way to deploy this client to production. Deploy with the `gh-pages` package, which is already included in `package.json`.

- Check out to the Git branch you’d like to deploy to GitHub Pages.
- Run this command in the terminal:

```shell
yarn deploy
```

- This will create a production build, and deploy it to GitHub Pages.
- Go to the _Pages_ tab in your repo’s settings in GitHub and confirm the site is live.

## Enabling HTTPS in development

Note: enabling HTTPS requires changes to both [`groceries`](https://github.com/andyjakubowski/groceries) and [`groceries_api`](https://github.com/andyjakubowski/groceries_api). For simplicity, I kept the instructions in this section the same in each repo.

Both this Groceries client and the [`groceries_api`](https://github.com/andyjakubowski/groceries_api) use HTTPS when deployed to production. You might want to enable HTTPS in development to get as close as possible to simulating a production environment.

When you’re done with this setup, you’ll be able to connect to your local server from any device in your local network using a custom made-up domain. This domain will only work in your local network.

We’ll be using `https://groceries.andy` for this client and `https://api.groceries.andy` for the API server.

This is a pretty involved process, and the individual steps may vary depending on your system. I’ll paint a broad picture and provide guidelines using macOS and iOS devices as examples here.

### Create a Certificate Authority and make your devices trust it

Follow the steps in this article to set it up:
[Create Your Own SSL Certificate Authority for Local HTTPS Development](https://deliciousbrains.com/ssl-certificate-authority-for-local-https-development/)

### Create SSL certificates for a custom domain to be used with the API server and the client

Follow the article mentioned in the previous step.

Once you’ve generated the certificates, copy them into your repo:

- For the client, place the certificates in `/ssl`
- For the API server, place the certificates in `/config/ssl`

The client and the API server are already configured to work with `groceries.andy` as the client URL and `api.groceries.andy` as the API server URL. If you want to use another custom domain, you’ll have to edit both projects:

Client

- The `HOST` env var in the `start-https` script in `package.json.
- The `REACT_APP_API_HOST_DEVELOPMENT_HTTPS` env var in `.env.development`

API server

- Edit the `config.hosts << "api.groceries.andy"` line in `/config/environments/development.rb`.

### Make your dev machine a DNS server for the custom domain

A made-up domain like `groceries.andy` doesn’t exist. We don’t want to go out into the open internet and ask any DNS servers where to find the computer behind `groceries.andy`. Instead, we’ll make our own machine the DNS server _for this domain only_.

To do that, we need to create a _resolver_ that will point from a domain name to a nameserver. Run the following command:

```shell
cd /etc
mkdir resolver
cd resolver
echo "nameserver 127.0.0.1" | sudo tee groceries.andy
```

You might not have write permissions to `/etc`. Cautiously run with `sudo` in that case.

Confirm that our resolver was created:

```shell
scutil --dns
```

### Resolve the custom domain to localhost

We’ll use `dnsmasq` as our DNS forwarder. Whenever someone asks for `groceries.andy`, we’ll forward them to `localhost`.

Install `dnsmasq` with Homebrew:

```shell
brew install dnsmasq
```

Find the configuration file for `dnsmasq`. On Apple silicon Macs it’s in `/opt/homebrew/etc/dnsmasq.conf`. Open the file and add the following line to it:

```shell
address=/groceries.andy/127.0.0.1
```

`dnsmasq` runs continously as a service on your machine. Restart it so that your changes take effect:

```shell
brew services restart dnsmasq
```

You might need to run the above command with `sudo`.

Run any of the following to test that the forwarding works:

```shell
ping -c 1 happy.tree
dscacheutil -q host -a name happy.tree
dig happy.tree @localhost
```

### Point other devices to your dev machine as their DNS server

On your iPhone, go to the settings of your local Wi-Fi. Change the DNS setup from _Automatic_ to _Manual_. Enter your dev machine’s local network IP address as the address of the DNS server.

### Run the dev server with HTTPS enabled

Phew, this was a lot! You should now be able to run the client and the API server with HTTPS in development.

Run your API server:

```shell
zsh -c "GROCERIES_API_HTTPS=true && rails s -b 'ssl://api.groceries.andy:9000?key=config/ssl/api.groceries.andy.key&cert=config/ssl/api.groceries.andy.crt'"
```

Run your client server:

```shell
yarn start-https
```
