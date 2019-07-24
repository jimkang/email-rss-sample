/* global __dirname */

var test = require('tape');
var http = require('http');
var serveStatic = require('serve-static');
var queue = require('d3-queue').queue;
var samplePosts = require('../sample-posts');
var assertNoError = require('assert-no-error');
var seedrandom = require('seedrandom');

const baseURL = 'http://localhost:3100';

var testCases = [
  {
    name: 'Sample one post within the last day for each feed',
    seed: 'one-post-one-day',
    feeds: [`${baseURL}/godtributes.rss`, `${baseURL}/colorer.rss`],
    expected: []
  }
];

var serve = serveStatic(__dirname + '/fixtures/');
var server = http.createServer(onRequest);
function onRequest(req, res) {
  serve(req, res, () => {});
}

server.listen(3100);

var q = queue(1);
testCases.forEach(queueTest);
q.awaitAll(closeServer);

function queueTest(testCase) {
  q.defer(runTest, testCase);
}

function runTest(testCase, runDone) {
  test(testCase.name, testSampleRSS);

  function testSampleRSS(t) {
    console.log('running test');
    var now = new Date();
    var yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    samplePosts(
      {
        random: seedrandom(testCase.seed),
        feeds: testCase.feeds,
        startDate: yesterday
      },
      checkSample
    );
    function checkSample(error, posts) {
      assertNoError(t.ok, error, 'No error when sampling posts.');
      t.deepEqual(posts, testCase.expected, 'Sampled posts are correct.');
      t.end();
      runDone();
    }
  }
}

function closeServer(error) {
  if (error) {
    console.log(error);
  }
  server.close();
}
