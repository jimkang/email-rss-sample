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
const dayInMS = 24 * 60 * 60 * 1000;

var testCases = [
  {
    name: 'Sample one post within the last day for each feed',
    seed: 'one-post-one-day',
    feedURLs: [`${baseURL}/godtributes.rss`, `${baseURL}/colorer.rss`],
    endDate: new Date('2019-07-25'),
    startDate: new Date('2019-07-25').getTime() - dayInMS,
    expectedPostCount: [1, 1] // One in each sample feed.
  },
  {
    name: 'Sample one post within the last day for one feed',
    seed: 'one-post-one-day-one-feed',
    feedURLs: [`${baseURL}/godtributes.rss`],
    endDate: new Date('2019-07-25'),
    startDate: new Date('2019-07-25').getTime() - dayInMS,
    expectedPostCount: [1] // One sample in one feed.
  },
  {
    name: 'Sample five posts within the last day for each feed',
    seed: 'five-posts-one-day',
    feedURLs: [`${baseURL}/godtributes.rss`, `${baseURL}/colorer.rss`],
    endDate: new Date('2019-07-25'),
    startDate: new Date('2019-07-25').getTime() - dayInMS,
    postsPerFeed: 5,
    expectedPostCount: [2, 2] // There's actually only two posts in a day.
  },
  {
    name: 'Sample five posts within a week-long span for each feed',
    seed: 'five-posts-one-week',
    feedURLs: [`${baseURL}/godtributes.rss`, `${baseURL}/colorer.rss`],
    endDate: new Date('2019-07-16'),
    startDate: new Date('2019-07-16').getTime() - dayInMS * 7,
    postsPerFeed: 5,
    expectedPostCount: [5, 0] // There are no Colorer posts in that range.
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
    samplePosts(
      {
        random: seedrandom(testCase.seed),
        feedURLs: testCase.feedURLs,
        startDate: testCase.startDate,
        endDate: testCase.endDate,
        postsPerFeed: testCase.postsPerFeed
      },
      checkSample
    );

    function checkSample(error, feedPostGroups) {
      assertNoError(t.ok, error, 'No error when sampling posts.');
      t.equal(
        feedPostGroups.length,
        testCase.expectedPostCount.length,
        'Get the correct number of sample feeds.'
      );
      feedPostGroups.forEach(checkFeedPostGroup);
      t.end();
      runDone();
    }

    function checkFeedPostGroup(feedPostGroup, i) {
      t.equal(
        feedPostGroup.length,
        testCase.expectedPostCount[i],
        'Get the correct number of posts in each sample feed.'
      );
      feedPostGroup.forEach(checkFeedPost);
    }

    function checkFeedPost(post) {
      t.ok(post.content, 'Post has content.');
      t.ok(
        post.published instanceof Date,
        'Post has a published property that is a date.'
      );
      t.ok(
        post.published > testCase.startDate &&
          post.published <= testCase.endDate,
        'Post published date is in specified range.'
      );
      t.ok(post.link, 'Post has a link.');
      console.log(
        'Check this link with a glance. (Every post should have a different link related to its source feed.)',
        post.link
      );
    }
  }
}

function tearDown(error) {
  if (error) {
    console.log(error);
  }
  server.close();
}
