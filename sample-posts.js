var feed = require('feed-read');
var queue = require('d3-queue').queue;
var Probable = require('probable').createProbable;
var sb = require('standard-bail')();

function samplePosts(
  {
    random = Math.random,
    feedURLs,
    postsPerFeed = 1,
    startDate,
    endDate,
    shouldLogFeedErrors
  },
  done
) {
  var probable = Probable({ random });
  var q = queue(8);
  feedURLs.forEach(queueFeedSample);
  q.awaitAll(done);

  function queueFeedSample(url) {
    q.defer(samplePostFromFeed, {
      url,
      probable,
      sampleSize: postsPerFeed,
      startDate,
      endDate,
      shouldLogFeedErrors
    });
  }
}

function samplePostFromFeed(
  { url, probable, sampleSize, startDate, endDate, shouldLogFeedErrors = true },
  done
) {
  feed(url, sb(pickPost, logError));

  function pickPost(articles) {
    //console.log(articles);
    var eligibleArticles = articles.filter(articleIsInDateRange);
    //console.log('eligibleArticles', eligibleArticles);
    done(null, probable.sample(eligibleArticles, sampleSize));
  }

  function articleIsInDateRange(article) {
    //console.log('published is date', article.published instanceof Date);
    return article.published > startDate && article.published <= endDate;
  }

  function logError(error) {
    if (shouldLogFeedErrors) {
      console.error(error, error.stack);
    }

    // Don't stop the music.
    done(null, []);
  }
}

module.exports = samplePosts;
