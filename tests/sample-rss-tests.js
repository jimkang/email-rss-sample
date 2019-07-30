/* global __dirname */

var test = require('tape');
var pushstateServer = require('pushstate-server');
var queue = require('d3-queue').queue;
var samplePosts = require('../sample-posts');
var assertNoError = require('assert-no-error');
var seedrandom = require('seedrandom');
//var request = require('request');

const testServerPort = 3100;
const baseURL = `http://localhost:${testServerPort}`;

var testCases = [
  {
    name: 'Sample one post within the last day for each feed',
    seed: 'one-post-one-day',
    feedURLs: [`${baseURL}/godtributes.rss`, `${baseURL}/colorer.rss`],
    expected: []
  }
];

var server = pushstateServer.start({
  port: testServerPort,
  directories: [__dirname + '/fixtures/']
});
setTimeout(startTests, 100);

function startTests() {
  var q = queue(1);
  testCases.forEach(queueTest);
  q.awaitAll(tearDown);

  function queueTest(testCase) {
    q.defer(runTest, testCase);
  }
}

function runTest(testCase, runDone) {
  test(testCase.name, testSampleRSS);

  function testSampleRSS(t) {
    //request(testCase.feedURLs[0], (error, res, body) => console.log(error, res, body));

    //var now = new Date();
    var endDate = new Date('2019-07-25');
    var startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
    samplePosts(
      {
        random: seedrandom(testCase.seed),
        feedURLs: testCase.feedURLs,
        startDate,
        endDate
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

function tearDown(error) {
  if (error) {
    console.log(error);
  }
  server.close();
}
