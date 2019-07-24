/* global process */
var fs = require('fs');
var Tracker = require('term-tracker');

if (process.argv.length < 3) {
  console.error(
    'Usage: node email-rss-sample.js <root directory of archive maintained by static-web-archive> [lastPage, a number like 0 or 18]'
  );
  process.exit();
}

var archiveDir = process.argv[2];
var metaDir = archiveDir + '/meta';
var termDir = archiveDir + '/term-data';
var lastPage;

if (process.argv.length > 3) {
  lastPage = +process.argv[3];
} else {
  lastPage = +fs.readFileSync(metaDir + '/last-page.txt', { encoding: 'utf8' });
}

if (isNaN(lastPage) || lastPage < 1) {
  console.error('Not enough pages in archive yet.');
  process.exit();
}

var pageToAdd = lastPage - 1;
var lastPageAdded;
const lastPageAddedPath = termDir + '/most-recent-page-added.txt';

if (fs.existsSync(lastPageAddedPath)) {
  lastPageAdded = +fs.readFileSync(lastPageAddedPath, { encoding: 'utf8' });
}

if (!isNaN(lastPageAdded) && lastPageAdded >= pageToAdd) {
  console.error(
    'Already added this page, not enough has changed to run analysis.'
  );
  process.exit();
}

var docs = JSON.parse(
  fs.readFileSync(`${metaDir}/${pageToAdd}.json`, { encoding: 'utf8' })
);

var tracker = Tracker({
  storeFile: termDir + '/terms.json',
  textProp: 'caption'
});

docs.forEach(tracker.track);

//var termsSorted = tracker.getTermsSortedByCount({ limit: 100 });

tracker.save(generateReports);

function generateReports(error) {
  if (error) {
    console.error('Error saving term tracker:', error);
    return;
  }

  fs.writeFileSync(lastPageAddedPath, pageToAdd, { encoding: 'utf8' });

  for (var i = 0; i <= pageToAdd; ++i) {
    calculateReportsForPage(i);
  }
}

function calculateReportsForPage(pageNumber) {
  var pageDocs = JSON.parse(
    fs.readFileSync(`${archiveDir}/meta/${pageNumber}.json`, {
      encoding: 'utf8'
    })
  );
  pageDocs.map(addTFIDF);
  var reports = pageDocs.map(getDocReport);
  fs.writeFileSync(
    `${termDir}/page-${pageNumber}-reports.json`,
    JSON.stringify(reports, null, 2),
    { encoding: 'utf8' }
  );
}

function addTFIDF(doc) {
  var docMeta = tracker.getDocMeta({ id: doc.id });
  if (!docMeta) {
    console.error(`Unable to get metadata for document ${doc.id}`);
    return;
  } else {
    //console.error('Found metdata for', doc.id);
  }
  var analyses = [];
  if (docMeta.termCount > 0 && docs.length > 0) {
    for (var term in docMeta.countsPerTerm) {
      var termInfo = tracker.getTerm({ term });
      if (termInfo && termInfo.count > 0) {
        let tf = docMeta.countsPerTerm[term] / docMeta.termCount;
        let idf = Math.log(docs.length / termInfo.count);
        analyses.push({
          term,
          tf,
          idf,
          tfidf: tf * idf
        });
      }
    }
  }
  doc.analyses = analyses;
}

function getDocReport(doc) {
  var sortedAnalyses = [];
  if (doc.analyses) {
    sortedAnalyses = doc.analyses.sort(aGoesBeforeB).slice(0, 10);
  }
  return {
    id: doc.id,
    topTerms: sortedAnalyses
  };
}

function aGoesBeforeB(a, b) {
  if (a.tfidf > b.tfidf) {
    return -1;
  } else {
    return 1;
  }
}
