var linkAttributeContextRegex = /href="(.*?)"/g;
const regexPrefixLength = 'href="'.length;

var { URL } = require('url');
var getAtPath = require('get-at-path');

function formatRSSPostsIntoHTML({ feedPostGroups, styleMarkup, pickSubject }) {
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

    return `${styleMarkup}
<div class="feed-post-group ${postGroupClass}">
  <h3 class="feed-title">${feedPostGroup.feedMetadata.title}</h3>
  <ul class="feed-posts">
    ${feedPostGroup.posts.map(formatPost).join('\n')}
  </ul>
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
      return content;

      function replaceWithAbsoluteURLInContent(localLinkContext) {
        const localURL = localLinkContext[1];
        // URL will figure out if localURL is actually local or not,
        // then append the base (feedMetadata) to it if necessary.
        var link = getAtPath(feedPostGroup, ['feedMetadata', 'link']);
        if (!localURL || !link) {
          return;
        }

        var url = new URL(localURL, link);
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
