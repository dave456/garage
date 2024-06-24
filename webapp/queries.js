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

const Pool = require('pg').Pool;
const pool = new Pool({
    user: 'dave',
    password: 'password',
    host: '192.168.1.51',
    database: 'garage',
    port: 5432
});

const getUsers = (req, resp) => {
    pool.query('SELECT * FROM users ORDER BY id ASC', (err, results) => {
        if (err) {
            console.log(err);
            resp.status(500).json(err);
        } else {
            resp.status(200).json(results.rows);
        }
    });
}

const getUserById = (req, resp) => {
    const id = parseInt(req.params.id);
    pool.query('SELECT * FROM users WHERE id = $1', [id], (err, results) => {
        if (err) {
            console.log(err);
            resp.status(500).json(err);
        } else {
            resp.status(200).json(results.rows);
        }
    });
}

const getDoorState = (req, resp) => {
    pool.query('SELECT * FROM doorstate WHERE id = 1', (err, results) => {
        if (err) {
            console.log(err);
            resp.status(500).json(err);
        } else {
            resp.status(200).json(results.rows);
        }
    });
}

const closeDoor = (req, resp) => {
    pool.query('UPDATE doorstate SET requested_door_state = 1, requested_on = now() WHERE id = 1', (err) => {
        if (err) {
            console.log(err)
            resp.status(500).json(err)
        } else {
            resp.status(201).json('OK')
        }
    })
}

const openDoor = (req, resp) => {
    pool.query('UPDATE doorstate SET requested_door_state = 0, requested_on = now() WHERE id = 1', (err) => {
        if (err) {
            console.log(err)
            resp.status(500).json(err)
        } else {
            resp.status(201).json('OK')
        }
    })
}

module.exports = {
    getUsers,
    getUserById,
    getDoorState,
    closeDoor,
    openDoor
}
