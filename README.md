# Symbiose Server

This server is necessary for Spotify authentification (see [the main repo](https://github.com/TomFevrier/symbiose-blank)).

It uses the [Spotify Authorization Code Flow](https://developer.spotify.com/documentation/general/guides/authorization-guide/) to link the user's Spotify account to the app, indefinitely, using a refreshable token.


### Getting started

- Set up a Spotify developer account and create a new app (see [the main repo](https://github.com/TomFevrier/symbiose-blank))

- Set up a Firebase account and create a new app and add a Firestore database to it (see [the main repo](https://github.com/TomFevrier/symbiose-blank))

- Replace the placeholders in the `.env` file with your Spotify credentials

- Generate a new key file called `symbiose_credentials.json` for the [Firebase Admin SDK service account](https://firebase.google.com/docs/admin/setup) at the root of the folder


- `npm install` to install all dependencies

### Running locally

- `node server.js` to start the server
