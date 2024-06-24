//
// MIT License
//
// Copyright (c) 2024 Dave Lindner
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
//

const express = require('express');
const app = express();
const port = 8080;
const db = require('./queries');

// Default home - serve up index.html
app.get('/', (req, res) => {
    // eslint-disable-next-line no-undef
    res.sendFile(__dirname + '/index.html');
});

// Serve up our client side javascript
app.get('/client.js', (req, res) => {
    // eslint-disable-next-line no-undef
    res.sendFile(__dirname + '/client.js');
});

// Routes to our REST API
app.get('/users', db.getUsers);
app.get('/door', db.getDoorState);

app.put('/close', db.closeDoor);
app.put('/open', db.openDoor);

// Listener
app.listen(port, () => {
    console.log(`Node is up and running at http://localhost:${port}`);
});
