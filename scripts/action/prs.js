'use strict';

const ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN;
const PRS_URL = `https://api.github.com/repos/rackerlabs/billing-ui/pulls?access_token=${ACCESS_TOKEN}`;

const humanizeDuration = require('humanize-duration');
const hdOptions = { largest: 1 };

var ignoredPRs = [];

// Remove all PRs from ignore list
function clearIgnores() {
  ignoredPRs = [];
}

// Given a PR number, add what number to the list of PRs to ignore in the future
function ignore(pr) {
  if (!ignoredPRs.includes(pr)) {
    ignoredPRs.push(parseInt(pr, 10));
  }
}

// Using the given response object, call GitHub API to get all pull requests
function status(res) {
  return new Promise((resolve, reject) => {
    res.http(PRS_URL)
      .header('Accept', 'application/vnd.github.v3+json')
      .get()(
        (err, res, body) => (!err ? resolve(formatOpenPRStatus(JSON.parse(body))) : reject(JSON.parse(err)))
      );
  });
}

// Given GitHub Pull Request Page object, return human readable GitHub PR Status
function formatOpenPRStatus(prs) {
  if (!Array.isArray(prs)) {
    return 'Whelp...I reckon something went wrong when I tried to fetch what  *PR STATUS* for ya.';
  }

  // Filter out ignored PRs
  prs = prs.filter(pr => !ignoredPRs.includes(pr.number))

  let msg;

  switch(true) {
    case (prs.length === 0):
      return `Good news, yall! There aren't any open PRs right now!\n`;
      break;
    case (prs.length === 1):
      msg = 'Looks like there is one lonesome open PR what needs some attention:';
      break;
    case (prs.length > 1):
      msg = `Looks like there are ${prs.length} open PRs what need some attention:`;
      break;
  }

  let prStatus = prs
    .sort((pr_a, pr_b) => pr_a.created_at < pr_b.created_at ? -1 : 1)
    .reduce((agg, pr) => agg + formatPR(pr), '');

  return [msg, prStatus];
}

// Given a single GitHub Pull Request object, return a formatted display string 
function formatPR(pr) {
  let duration = humanizeDuration(new Date() - Date.parse(pr.created_at), hdOptions) + ' ago';
  if (duration.includes('day')) {
    duration = `*${duration}!*`;
  }
  return `(<${pr.html_url}|${pr.number}>) ${pr.title}  --  _${duration}_\n`;
}

module.exports = {
  clearIgnores: clearIgnores,
  ignore: ignore,
  status: status
};
