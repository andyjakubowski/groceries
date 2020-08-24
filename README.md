# Overview

- This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app)
- HTTPS is enabled in production

## SSL in Development

- HTTPS is enabled in `.env.development`
- I wanted to be able to test not just on my local machine, but also on other devices in the local network, such as phones
- I didn’t want the browser to display any “not secure” warnings, which meant I needed an SSL certificate
- you can’t issue SSL certificates for localhost, or LAN IP addresses, that would be trusted by browsers
- so I issued a certificate for a made-up hostname `groceries.andy`
- that meant I also needed to set up a DNS resolver in my local network, so that `groceries.andy` would resolve to the address of my dev machine in the local network
- I have no access to my router, so I set up _dnsmasq_ on my dev machine, and pointed test devices at that machine as a DNS server

## Usage

- set up dnsmasq to resolve groceries.andy to your dev machine’s LAN IP address (this step is not described here)
- for some reason, I often need to manually restart dnsmasq even though it seems to be set up correctly: `sudo brew services restart dnsmasq`
- run the [Groceries API server](https://github.com/andyjakubowski/groceries_api): `rails s -b 'ssl://api.groceries.andy:9000?key=config/ssl/api.groceries.andy.key&cert=config/ssl/api.groceries.andy.crt'`
- run this React client app: `yarn start`
- you should now be able to access the app at `https://groceries.andy:3000/`
