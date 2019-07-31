/* global __dirname */

var test = require('tape');
var formatRSSPostsIntoHTML = require('../format-rss-posts-into-html');
var fs = require('fs');
var feedPostGroupExamples = require('./fixtures/feed-post-groups');

const styleMarkup = fs.readFileSync(
  __dirname + '/../behavior/default-style.html',
  { encoding: 'utf8' }
);

var testCases = [
  {
    name: 'Format one post each from two feeds into HTML',
    opts: {
      feedPostGroups: feedPostGroupExamples['one-post-each-from-two-feeds'],
      styleMarkup
    },
    expected: '' //HTML string goes here.
  },
  {
    name: 'Format one post from one feed',
    opts: {
      feedPostGroups: feedPostGroupExamples['one-post-from-one-feed'],
      styleMarkup
    },
    expected: '' //HTML string goes here.
  },
  {
    name: 'Format two posts from two feeds',
    opts: {
      feedPostGroups: feedPostGroupExamples['two-posts-from-two-feeds'],
      styleMarkup
    },
    expected: '' //HTML string goes here.
  },
  {
    name: 'Format five posts one feed and zero from another',
    opts: {
      feedPostGroups:
        feedPostGroupExamples[
          'five-posts-from-one-feed-zero-posts-from-another'
        ],
      styleMarkup
    },
    expected: '' //HTML string goes here.
  }
];

testCases.forEach(runTest);

function runTest(testCase) {
  test(testCase.name, testFormatRSS);

  function testFormatRSS(t) {
    const html = formatRSSPostsIntoHTML(testCase.opts);
    t.ok(html, 'HTML is there.');

    const filename = `${__dirname}/tmp/${testCase.name.replace(
      / /g,
      '-'
    )}.html`;
    fs.writeFileSync(filename, html, { encoding: 'utf8' });
    console.log(
      `Wrote out file://${filename} for visual inspection. Make sure it is OK.`
    );

    t.end();
  }
}
