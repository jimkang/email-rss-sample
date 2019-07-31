/* global __dirname, process */

var minimist = require('minimist');
var fs = require('fs');

var { htmlFile, to, from, subject } = minimist(process.argv.slice(2));

if (!htmlFile || !to || !from) {
  console.error(`Usage: node html-into-email.js \\
    --htmlFile <relative path to HTML body of email> \\
    --to <email address> \\
    --from <email address> \\
    --subject <optional, defaults to "What the bots have done today, <today's date>"> \\
    > email.txt`);
  process.exit();
}

if (!subject) {
  subject = `What the bots have done today, ${new Date().toLocaleString()}`;
}

const bodyHTML = fs.readFileSync(__dirname + '/' + htmlFile, {
  encoding: 'utf8'
});

const emailText = `To: ${to}
From: ${from}
Subject: ${subject}
Content-Type: text/html; charset="utf8"

${bodyHTML}

`;

console.log(emailText);
