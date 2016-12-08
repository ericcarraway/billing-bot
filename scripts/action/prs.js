'use strict';

const ACCESS_TOKEN = `?access_token=${process.env.GITHUB_ACCESS_TOKEN}`;
const PRS_URL = `https://api.github.com/repos/rackerlabs/billing-ui/pulls${ACCESS_TOKEN}`;

const humanizeDuration = require('humanize-duration');
const hdOptions = { largest: 1 };
const rxComplete = /(- \[x])/g;
const rxIncomplete = /(- \[ ])/g;
const reviewers = ['ericcarraway', 'TheNando', 'S1ngS1ng', 'jonkruse00', 'arc6789'];

var remainingReviewers = ['ericcarraway', 'TheNando', 'S1ngS1ng', 'jonkruse00', 'arc6789'];
var ignoredPRs = [];

// Remove all PRs from ignore list
function clearIgnores() {
  ignoredPRs = [];
}

// Given a Pull Request object, fetch the statuses object and update the PR with a status
function fetchPRStatus(pr, res) {
  return new Promise((resolve, reject) => {
    res.http(pr.statuses_url + ACCESS_TOKEN)
      .header('Accept', 'application/vnd.github.v3+json')
      .get()(
        (err, res, body) => {
          if (err) {
            reject(JSON.parse(err));
          }

          pr.status = JSON.parse(body)[0].state;
          resolve(pr);
        }
      );
  });
}

// Given GitHub Pull Request Page object, return human readable GitHub PR Status
function formatOpenPRs(prs) {
  if (!Array.isArray(prs)) {
    return 'Whelp...I reckon something went wrong when I tried to fetch that *PR STATUS* for ya.';
  }

  let openPrs = [];

  switch(true) {
    case (prs.length === 0):
      return [`Good news, yall! There aren't any open PRs right now!`];
      break;
    case (prs.length === 1):
      openPrs.push('Looks like there is one lonesome open PR what needs some attention:');
      break;
    case (prs.length > 1):
      openPrs.push(`Looks like there are ${prs.length} open PRs what need some attention:`);
      break;
  }

  prs
    .sort((pr_a, pr_b) => pr_a.created_at < pr_b.created_at ? -1 : 1)
    .forEach(pr => openPrs.push(formatPR(pr)));

  return openPrs;
}

// Given a single GitHub Pull Request object, return a formatted display string 
function formatPR(pr) {
  let number = `<${pr.html_url}|${pr.number}>`;
  pr.status = pr.status
    .replace('success', ':gh_check:')
    .replace('pending', ':gh_building:')
    .replace('failure', ':gh_fail:')
    .replace('error', ':gh_fail:');

  let status = `>>> ${pr.title} ${pr.status}\n`
  status += `#${number} opened ${prDuration(pr)} by ${pr.user.login}${prCompletion(pr)}`;
  return status;
}

function prCompletion(pr) {
  let complete = (pr.body.match(rxComplete) || []).length;
  let total = complete + (pr.body.match(rxIncomplete) || []).length;

  if (total) {
    return ` :checklist: ${complete} of ${total}`;
  }

  return '';
}

function prDuration(pr) {
  let duration = humanizeDuration(new Date() - Date.parse(pr.created_at), hdOptions) + ' ago';
  let hasDay = (duration.includes('day') ? '*' : '');
  return ` _${hasDay}${duration}${hasDay}_`;
}

// Given a PR number, add that number to the list of PRs to ignore in the future
function ignore(pr) {
  if (!ignoredPRs.includes(pr)) {
    ignoredPRs.push(parseInt(pr, 10));
  }
}

// Using the given response object, call GitHub API to get all pull requests
function overview(robot) {
  return new Promise((resolve, reject) => {
    robot.http(PRS_URL)
      .header('Accept', 'application/vnd.github.v3+json')
      .get()(
        (err, res, body) => {
          let prs = JSON.parse(body);

          if (err) {
            reject(JSON.parse(err));
          }

          // Filter out ignored PRs
          prs = prs.filter(pr => !ignoredPRs.includes(pr.number));

          // Get statuses for each PR
          let prPromises = prs.map(pr => fetchPRStatus(pr, robot));
          Promise
            .all(prPromises)
            .then(values => {
              resolve(formatOpenPRs(values))
            });
        }
      );
  });
}

function pickReviewers(submitter) {
  let selected = [];
  let unshiftSubmitter = false;

  if (remainingReviewers.length <= 3) {
    remainingReviewers = remainingReviewers.concat(reviewers);
  }

  while (selected.length < 2) {
    let reviewer = remainingReviewers.shift();

    if (reviewer !== submitter) {
      selected.push(reviewer);
    } else {
      unshiftSubmitter = true;
    }
  }

  if (unshiftSubmitter) {
    remainingReviewers.unshift(submitter);
  }

  return selected;
}

module.exports = {
  clearIgnores: clearIgnores,
  ignore: ignore,
  overview: overview,
  pickReviewers: pickReviewers
};
