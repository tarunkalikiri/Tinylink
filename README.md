# TinyLink Project

A simple URL shortener built with Node.js and Express. Users can shorten URLs, view click statistics, and manage links.

## Features
- Create short links with optional custom codes
- Redirect short URLs to original links
- Track clicks and last clicked time
- Delete links
- Dashboard and stats pages
- Health check endpoint `/healthz`

## Usage
1. Install dependencies: `npm install`
2. Set environment variables in `.env`
3. Start server: `node tinylink.js`
4. Open `http://localhost:3000` in your browser
