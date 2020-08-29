/* global __dirname */

var test = require('tape');
var formatRSSPostsIntoHTML = require('../format-rss-posts-into-html');
var fs = require('fs');
var feedPostGroupExamples = require('./fixtures/feed-post-groups');
var PickSubjectFromPostGroups = require('../pick-subject-from-post-groups');

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
  },
  {
    name: 'Use a post as the email subject',
    opts: {
      feedPostGroups: feedPostGroupExamples['two-posts-from-two-feeds'],
      styleMarkup,
      pickSubject: PickSubjectFromPostGroups()
    },
    htmlChecker(t, html) {
      t.ok(
        html.includes('<!--<SUBJECT>'),
        'HTML has the SUBJECT comment in it.'
      );
    }
  },
  {
    name: 'Hide feed titles',
    opts: {
      feedPostGroups: feedPostGroupExamples['two-posts-from-two-feeds'],
      styleMarkup,
      pickSubject: PickSubjectFromPostGroups(),
      showFeedTitles: false
    },
    htmlChecker(t, html) {
      t.ok(
        !html.includes('<h3 class="feed-title">'),
        'HTML does not contain feed title'
      );
    }
  },
  {
    name: 'Add links to posts',
    opts: {
      feedPostGroups: feedPostGroupExamples['two-posts-from-two-feeds'],
      styleMarkup,
      pickSubject: PickSubjectFromPostGroups(),
      addLinksToPosts: true
    },
    htmlChecker(t, html) {
      t.ok(
        html.includes('class="link-to-post"'),
        'HTML does contain links to posts'
      );
    }
  },
  {
    name: 'Alias link titles',
    opts: {
      feedPostGroups: feedPostGroupExamples['two-posts-from-two-feeds'],
      styleMarkup,
      pickSubject: PickSubjectFromPostGroups(),
      addLinksToPosts: true,
      linkTitleAliasFn() {
        return 'fhqwhgads';
      }
    },
    htmlChecker(t, html) {
      t.ok(
        html.includes('class="link-to-post"><h3>fhqwhgads</h3></a>'),
        'Link title comes from aliasing function'
      );
    }
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
    if (testCase.htmlChecker) {
      testCase.htmlChecker(t, html);
    }

    t.end();
  }
}
