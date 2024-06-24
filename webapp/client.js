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

console.log('Started client side');

const closeButton = document.getElementById('closeButton');
closeButton.addEventListener('click', function() {
    console.log('close door button clicked');
    fetch('/close', {method: 'PUT'})
        .then(function(resp) {
            if (resp.ok) {
                console.log('close door request accepted');
            } else {
                // we throw here to break our chain
                console.log('Bad response: ', resp);
                throw new Error('close door request failed');
            }
        })
        .catch(function(err) {
            console.log(err);
        })
});

const openButton = document.getElementById('openButton');
openButton.addEventListener('click', function() {
    console.log('open door button clicked');
    fetch('/open', {method: 'PUT'})
        .then(function(resp) {
            if (resp.ok) {
                console.log('open door request accepted');
            } else {
                // we throw here to break our chain
                console.log('Bad response: ', resp);
                throw new Error('open door request failed');
            }
        })
        .catch(function(err) {
            console.log(err);
        })
});

// Blech - an element refresh....
setInterval(function() {
    fetch('/door', {method: 'GET'})
        .then(function(resp) {
            if (resp.ok) {
                return resp.json();
            } else {
                console.log('Request failed: ', resp);
                throw new Error('Request failed');
            }
        })
        .then(function(data) {
            // so we want to get cute with the door status and try and reflect transition states

            // if the operation as failed that gets precedence
            if (data && data[0] && data[0].error_state != 0) {
                document.getElementById('doorStatus').innerHTML = 'Door operation failed!';
            } else if (data && data[0] && data[0].door_state == 1) {
                document.getElementById('doorStatus').innerHTML = 'Door is closed.';
            } else if (data && data[0] && data[0].door_state == 0) {
                document.getElementById('doorStatus').innerHTML = 'Door is open.';
            }
        })
        .catch(function(err) {
            console.log(err);
        })
}, 3000);
