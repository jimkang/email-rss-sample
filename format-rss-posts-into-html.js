var linkAttributeContextRegex = /href="(.*?)"/g;
const regexPrefixLength = 'href="'.length;

var path = require('path');

function formatRSSPostsIntoHTML({
  feedPostGroups,
  styleMarkup,
  pickSubject,
  showFeedTitles = true,
  addLinksToPosts = false,
  linkTitleAliasFn
}) {
  var formattedGroups = feedPostGroups.map(formatFeedPostGroup);
  var html = '';
  if (pickSubject) {
    html += `<!--<SUBJECT>${pickSubject(feedPostGroups)}</SUBJECT>-->\n`;
  }
  html += formattedGroups.join('\n');
  return html;

  function formatFeedPostGroup(feedPostGroup) {
    const postGroupClass = feedPostGroup.feedMetadata.title
      .replace(/ /g, '-')
      .replace(/@/g, '')
      .toLowerCase();

    var feedTitle = '';
    if (showFeedTitles) {
      feedTitle = `<h3 class="feed-title">${feedPostGroup.feedMetadata.title}</h3>`;
    }

    return `${styleMarkup}
<div class="feed-post-group ${postGroupClass}">
  ${feedTitle}
  <section class="feed-posts">
    ${feedPostGroup.posts.map(formatPost).join('\n')}
  </section>
</div>`;

    function formatPost(post) {
      var linkContexts = [];
      var linkContext;
      var content = post.content;
      while ((linkContext = linkAttributeContextRegex.exec(content))) {
        linkContexts.push(linkContext);
      }
      linkContexts.sort(compareLinkContextIndexesDesc);

      linkContexts.forEach(replaceWithAbsoluteURLInContent);
      var postHTML = `<div class="post-enclosure">${content}</div>`;
      if (addLinksToPosts) {
        let linkTitle = feedPostGroup.feedMetadata.title;
        if (linkTitleAliasFn) {
          linkTitle = linkTitleAliasFn(post);
        }
        const linkToPost = `<a href="${post.link}" class="link-to-post"><h3>${linkTitle}</h3></a>`;
        postHTML = `<div class="post-enclosure">${linkToPost}\n${content}\n</div>`;
      }
      return postHTML;

      function replaceWithAbsoluteURLInContent(localLinkContext) {
        const localURL = localLinkContext[1];
        // URL will figure out if localURL is actually local or not,
        // then append the base to it if necessary.
        const base = path.parse(post.link).dir + '/';
        var url = new URL(localURL, base);
        const replaceStart = regexPrefixLength + localLinkContext.index;
        content =
          content.slice(0, replaceStart) +
          url.toString() +
          content.slice(replaceStart + localURL.length);
      }
    }
  }
}

// linkContext is the result array of a regex.exec() call.
function compareLinkContextIndexesDesc(a, b) {
  if (a.index < b.index) {
    return 1;
  } else {
    return -1;
  }
}

module.exports = formatRSSPostsIntoHTML;
