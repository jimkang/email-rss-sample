email-rss-sample
==================

Grabs several RSS feeds and picks samples from each one from the given time period, then generates an email summary and sends it via sendmail.

Installation
------------

- Clone this repo.
- Optionally, create a config.js file containing posting target configs that look like the [post-it targets array](https://github.com/jimkang/post-it#usage).
- Optionally, schedule it to run via cron.

Usage
-----

    node email-rss-sample.js <static-web-archive root directory>

Output:

    TODO
    { term: 'good', count: 2, countsInRefs: { b: 2 }, refs: ['b'] }
    { term: 'button', count: 1, countsInRefs: { a: 1 }, refs: ['a'] }
    [
      { term: 'the', count: 4, countsInRefs: { a: 2, b: 2 }, refs: ['a', 'b'] },
      {
        term: 'delightful',
        count: 3,
        countsInRefs: { a: 1, b: 2 },
        refs: ['a', 'b']
      },
      { term: 'hit', count: 3, countsInRefs: { a: 2, b: 1 }, refs: ['a', 'b'] },
      {
        term: 'blaster',
        count: 2,
        countsInRefs: { a: 1, b: 1 },
        refs: ['a', 'b']
      },
      { term: 'it', count: 2, countsInRefs: { a: 1, b: 1 }, refs: ['a', 'b'] },
      {
        term: 'like',
        count: 2,
        countsInRefs: { b: 1, c: 1 },
        refs: ['b', 'c']
      },
      { term: 'good', count: 2, countsInRefs: { b: 2 }, refs: ['b'] },
      { term: 'really', count: 2, countsInRefs: { a: 2 }, refs: ['a'] },
      { term: 'state', count: 2, countsInRefs: { b: 2 }, refs: ['b'] },
      { term: 'know', count: 2, countsInRefs: { a: 2 }, refs: ['a'] }
    ]
    
License
-------

The MIT License (MIT)

Copyright (c) 2018 Jim Kang

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the 'Software'), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
