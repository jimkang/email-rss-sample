var Probable = require('probable').createProbable;
var sanitizeHTML = require('sanitize-html');
var flatten = require('lodash.flatten');
var compact = require('lodash.compact');
var pluck = require('lodash.pluck');

var disallowedImageCaptionRegex = /High-def.*version/;
var disallowedSubjects = ['Source | Dem bones dem bones dem – dry bones!'];
const postfix = ` | Bot doings ${new Date().toISOString().split('T')[0]}`;

var multilineStarts = ['Knock knock!', "The most successful people I've met:"];

function pickSubjectFromPostGroups(random = Math.random) {
  return pickSubjectFromPostGroups;

  function pickSubjectFromPostGroups(postGroups) {
    var probable = Probable({ random });
    var contents = pluck(flatten(pluck(postGroups, 'posts')), 'content');
    var subjects = compact(contents.map(parseContent)).filter(subjectIsOK);
    return formatSubject(probable.pick(subjects));
  }

  function parseContent(content) {
    var parts = content.split('</time>');
    if (parts.length > 1) {
      var sanitized = sanitizeHTML(parts[1], { allowedTags: [] }).trim();
      if (sanitized && sanitized.length > 0) {
        return sanitized;
      }
    }
  }
}

function formatSubject(subject) {
  var formatted = subject;
  // Include only one line if there are multiple lines
  // and only one part of the line if it is separated by |.
  if (subject && subject.includes('\n')) {
    // UNLESS it is a knock-knock joke.
    let lines = subject.split('\n');
    //console.error('lines', lines);
    if (multilineStarts.includes(lines[0])) {
      formatted = lines
        .slice(0, 3)
        .map(s => s.trim())
        .join(' ');
    } else {
      formatted = lines[0];
    }
  }
  if (formatted && formatted.includes('|')) {
    formatted = subject.split('|')[0];
  }
  return formatted + postfix;
}

function subjectIsOK(subject) {
  return (
    !subject.match(disallowedImageCaptionRegex) &&
    !disallowedSubjects.includes(subject)
  );
}

module.exports = pickSubjectFromPostGroups;
