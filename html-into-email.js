/* global __dirname, process, Buffer */

var minimist = require('minimist');
var fs = require('fs');
var sanitizeHTML = require('sanitize-html');
var qp = require('@ronomon/quoted-printable');

var subjectRegex = /<SUBJECT>(.*)<\/SUBJECT>/;

const multipartBoundary = ':.:.:.:.:.:.:.:.:.:.:';

var { htmlFile, from, unsubscribeEmail, subject } = minimist(
  process.argv.slice(2)
);

if (!htmlFile || !from) {
  console.error(`Usage: node html-into-email.js \\
    --htmlFile <relative path to HTML body of email> \\
    --from <email address> \\
    --unsubscribeEmail <email address> \\
    --subject <optional, looks in HTML for <SUBJECT></SUBJECT> comment, then defaults to "What the bots have done today, <today's date>"> \\
    > email.txt`);
  process.exit();
}

const bodyHTML = fs.readFileSync(__dirname + '/' + htmlFile, {
  encoding: 'utf8'
});
const encodedBodyHTML = qp.encode(Buffer.from(bodyHTML, 'utf8'));

if (!subject) {
  let match = bodyHTML.match(subjectRegex);
  if (match) {
    subject = match[1];
  }
}
if (!subject) {
  subject = `What the bots have done today, ${new Date().toLocaleString()}`;
}

var unsubscribeHeader = '';
if (unsubscribeEmail) {
  unsubscribeHeader = `List-Unsubscribe: "<mailto:${unsubscribeEmail}>"`;
}

const plainTextBody = sanitizeHTML(bodyHTML, { allowedTags: [] }).trim();
const emailText = `From: ${from}
Subject: ${subject}
${unsubscribeHeader}
MIME-Version: 1.0
Content-Type: multipart/alternative; boundary="${multipartBoundary}"

--${multipartBoundary}
Content-Type: text/plain; charset=utf-8

${plainTextBody}

--${multipartBoundary}
Content-Type: text/html; charset=utf-8
Content-Transfer-Encoding: quoted-printable

${encodedBodyHTML}

--${multipartBoundary}--`;

console.log(emailText);
