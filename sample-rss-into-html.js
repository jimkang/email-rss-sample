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
  showFeedTitles,
  addLinksToPosts,
  urlPrefixToLinkTitleFile,
  enclosureTag,
  introTextFile,
  _
} = minimist(process.argv.slice(2));
var feedURLs = _;
if (feedURLs.length < 1) {
  console.error(`Usage: node sample-rss-into-html.js \\
    --endDate 2019-07-30 <optional, defaults to now> \\
    --numberOfDaysToSample 3 <optional, defaults to 1> \\
    --postsPerFeed 3 <optional, defaults to 1> \\
    --styleMarkupFile behavior/custom--style.html <optional, defaults to behavior/default-style.html> \\
    --showFeedTitles <optional, defaults to false> \\
    --addLinksToPosts <optional, defaults to false> \\
    --urlPrefixToLinkTitleFile <optional, path to JSON file> \\
    --enclosureTag <optional, defaults to 'div'> \\
    --introTextFile <optional> \\
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

if (showFeedTitles) {
  if (showFeedTitles === 'false') {
    showFeedTitles = false;
  }
}

if (addLinksToPosts) {
  if (addLinksToPosts === 'false') {
    addLinksToPosts = false;
  }
}

var urlPrefixesToLinkTitles;
if (urlPrefixToLinkTitleFile) {
  urlPrefixesToLinkTitles = JSON.parse(
    fs.readFileSync(__dirname + '/' + urlPrefixToLinkTitleFile, {
      encoding: 'utf8'
    })
  );
}

let introText;
if (introTextFile) {
  introText = fs.readFileSync(introTextFile, { encoding: 'utf8' });
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
      showFeedTitles,
      addLinksToPosts,
      enclosureTag,
      introText,
      pickSubject: PickSubjectFromPostGroups(Math.random),
      linkTitleAliasFn: urlPrefixesToLinkTitles
        ? getLinkTitleForPost
        : undefined
    })
  );
}

function handleError(error) {
  console.error(error, error.stack);
}

// Receives a post object.
function getLinkTitleForPost({ link }) {
  for (var urlPrefix in urlPrefixesToLinkTitles) {
    if (link.startsWith(urlPrefix)) {
      return urlPrefixesToLinkTitles[urlPrefix];
    }
  }
}
