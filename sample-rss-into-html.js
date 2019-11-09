/* global __dirname, process */

var samplePosts = require('./sample-posts');
var minimist = require('minimist');
var formatRSSPostsIntoHTML = require('./format-rss-posts-into-html');
var fs = require('fs');
var PickSubjectFromPostGroups = require('./pick-subject-from-post-groups');

var sb = require('standard-bail')();

const dayInMS = 24 * 60 * 60 * 1000;

var {
  endDate,
  numberOfDaysToSample,
  postsPerFeed,
  styleMarkupFile,
  _
} = minimist(process.argv.slice(2));
var feedURLs = _;

if (feedURLs.length < 1) {
  console.error(`Usage: node sample-rss-into-html.js \\
    --endDate 2019-07-30 <optional, defaults to now> \\
    --numberOfDaysToSample 3 <optional, defaults to 1> \\
    --postsPerFeed 3 <optional, defaults to 1> \\
    --styleMarkupFile behavior/custom--style.html <optional, defaults to behavior/default-style.html> \\
    <feed1 URL> <feed2 URL> ... \\
    > email.html`);
  process.exit();
}

if (endDate) {
  endDate = new Date(endDate);
} else {
  endDate = new Date();
}

if (!numberOfDaysToSample) {
  numberOfDaysToSample = 1;
}

var startDate = new Date(endDate.getTime() - numberOfDaysToSample * dayInMS);

if (!postsPerFeed) {
  postsPerFeed = 1;
}

if (!styleMarkupFile) {
  styleMarkupFile = 'behavior/default-style.html';
}

samplePosts(
  {
    random: Math.random,
    feedURLs,
    endDate,
    startDate,
    postsPerFeed
  },
  sb(makeHTML, handleError)
);

function makeHTML(feedPostGroups) {
  const styleMarkup = fs.readFileSync(__dirname + '/' + styleMarkupFile, {
    encoding: 'utf8'
  });
  console.log(
    formatRSSPostsIntoHTML({
      feedPostGroups,
      styleMarkup,

      pickSubject: PickSubjectFromPostGroups(Math.random)
    })
  );
}

function handleError(error) {
  console.error(error, error.stack);
}
