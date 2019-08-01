#!/usr/local/bin/node

var process = require('process');
var fs = require('fs');
var { execFileSync } = require('child_process');

var email = '';
process.stdin.setEncoding('utf8');
process.stdin.on('readable', readStdIn);
process.stdin.on('end', respondToEmail);

function readStdIn() {
  var chunk;
  while ((chunk = process.stdin.read()) !== null) {
    email += chunk;
  }
}

function respondToEmail() {
  log('last-received-email.txt', email);

  var lines = email.split('\n');
  const fromValue = getValueFromLines(lines, 'From');
  const toValue = getValueFromLines(lines, 'To');
  var replyToValue = getValueFromLines(lines, 'Reply-To');
  const subjectValue = getValueFromLines(lines, 'Subject');

  log(
    'last-received-values.txt',
    [fromValue, toValue, replyToValue, subjectValue].join('\n')
  );

  if (
    !toValue === 'bot@smidgeo.com' &&
    !toValue.includes('<bot@smidgeo.com>')
  ) {
    log('last-bail.txt', 'toValue did not check out.');
    return;
  }
  if (
    !fromValue ||
    !(
      fromValue.includes('support@tinyletter.com') ||
      fromValue.includes('jimkang@fastmail.com')
    )
  ) {
    log('last-bail.txt', `fromValue ( ${fromValue} ) did not check out.`);
    return;
  }

  if (!replyToValue) {
    replyToValue = fromValue;
  }

  var simpleDestEmail = replyToValue;
  var matchResult = replyToValue.match(/<(.*)>/);
  if (matchResult && matchResult[1]) {
    simpleDestEmail = matchResult[1];
  }

  const replyEmail = `To: ${simpleDestEmail}
From: bot@smidgeo.com
Subject: ${subjectValue}

OK!

`;
  log('last-composed-response.txt', replyEmail);

  execFileSync('/usr/sbin/sendmail', [simpleDestEmail], { input: replyEmail });
}

function getValueFromLines(lines, fieldName) {
  const line = lines.find(line => line.startsWith(`${fieldName}: `));
  if (line) {
    let parts = line.split(': ');
    if (parts.length > 1) {
      return parts[1];
    }
  }
}

// TODO: Append, maybe?
function log(logFile, message) {
  fs.writeFileSync(`/opt/email-rss-sample/log/${logFile}`, message, {
    encoding: 'utf8'
  });
}
