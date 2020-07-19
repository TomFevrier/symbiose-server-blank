const express = require('express');
const request = require('request');
const queryString = require('querystring');
const admin = require('firebase-admin');
const dotenv = require('dotenv');
dotenv.config();

let credentials = require('./symbiose_credentials.json')
admin.initializeApp({
	credential: admin.credential.cert(credentials)
});
const firestore = admin.firestore();

const app = express();

const spotifyAuthorizeURL = "https://accounts.spotify.com/authorize";
const spotifyTokenURL = "https://accounts.spotify.com/api/token";
const redirectURI = process.env.REDIRECT_URI || 'http://localhost:8888/callback';

const scopes = ['user-read-recently-played', 'streaming', 'user-read-email', 'user-read-private', 'playlist-modify-public', 'user-library-read', 'user-top-read', 'user-read-playback-state', 'user-modify-playback-state', 'user-read-playback-position', 'user-read-currently-playing'];

let appUrl;
let uid;

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET');
	next();
});

app.get('/', (req, res) => {
	res.send("It's alive!!!!!");
});

app.get('/login', (req, res) => {
	appUrl = req.query.appUrl;
	uid = req.query.uid;
	const query = queryString.stringify({
		response_type: 'code',
		client_id: process.env.SPOTIFY_CLIENT_ID,
		redirect_uri: redirectURI,
		scope: scopes.join(' ')
	});
	res.redirect(`${spotifyAuthorizeURL}?${query}`);
});

app.get('/callback', (req, res) => {
	const code = req.query.code;
	const options = {
		url: spotifyTokenURL,
		form: {
			code: code,
			redirect_uri: redirectURI,
			grant_type: 'authorization_code'
		},
		headers: {
			'Authorization': `Basic ${new Buffer(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
		},
		json: true
	};
	request.post(options, (err, response, body) => {
		if (err) res.redirect(appUrl);
		else if (uid) {
			firestore.collection('users').doc(uid).set({
				accessToken: body.access_token,
				refreshToken: body.refresh_token,
				expirationDate: Date.now() + body.expires_in * 1000
			}, { merge: true });
			// res.redirect(appUrl);
		}
		res.send(body);
	});
});

app.get('/refresh', (req, res) => {
	const refreshToken = req.query.refreshToken;
	const uid = req.query.uid;
	const options = {
		url: spotifyTokenURL,
		form: {
			refresh_token: refreshToken,
			redirect_uri: redirectURI,
			grant_type: 'refresh_token'
		},
		headers: {
			'Authorization': `Basic ${new Buffer(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
		},
		json: true
	};
	request.post(options, (err, response, body) => {
		if (err) res.redirect(appUrl);
		else if (uid) {
			firestore.collection('users').doc(uid).set({
				accessToken: body.access_token,
				expirationDate: Date.now() + body.expires_in * 1000
			}, { merge: true })
			.then(() => res.sendStatus(200));
		}
		res.send(body);
	});
});

const port = process.env.PORT || 8888;

app.listen(port);
console.log(`Listening on port: ${port}`);
