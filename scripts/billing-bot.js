//  Description:
//    Helpful task runner bot for Encore Billing UI team
//
//  Dependencies:
//    "humanize-duration": "^3.9.1"
//
//  Configuration:
//    HUBOT_SLACK_TOKEN - Billing Bot's Slack API Token
//    GITHUB_ACCESS_TOKEN - GitHub 2fa Access token to access Billing UI Repo
//
//  Commands:
//    celebrat - :toot:
//    ignore pr <PR#> - Don't include that PR in status reports
//    pr status - Get status of project PRs
//    clear ignores - Clear any PRs from ignore list
//
//  Notes:
//    Find more script examples at https://github.com/github/hubot/blob/master/docs/scripting.md


'use strict';

const prs = require('./action/prs');

module.exports = function (robot) {


  /********************/
  /* Celebratory Toot */
  /********************/

  robot.hear(/celebrat/i, (res) => res.send(':toot:'));


  /*****************/
  /* Clear Ignores */
  /*****************/

  robot.respond(/clear ignores/i, res => {
    let ignore = res.match[1];
    prs.clearIgnores();
    res.send(`No problem! I won't leave out no more PRs from my status updates.`);
  });
  

  /**************/
  /* Ignore PRs */
  /**************/

  robot.respond(/ignore pr (.*)/i, res => {
    let ignore = res.match[1];
    prs.ignore(ignore);
    res.send(`You got it! I won't mention PR #${ignore} no more.`);
  });


  /*************/
  /* PR Status */
  /*************/

  robot.hear(/pr status/i, res => {
    res.send('Let me look that up for ya...');
    prs.overview(robot)
      .then(
        overview => overview.forEach(line => res.send(line))
      );
  });


  /*******************/
  /* Reviewer Picker */
  /*******************/

  robot.hear(/Pull request submitted by (\w+)/i, res => {
    let submitter = res.match[1];
    let folks = prs.pickReviewers(submitter);
    res.send(`I reckon it's ${folks.join(' and ')}'s turn to review a PR.`);
  });

}
