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
//    pr status - Get status of project PRs
//    celebrat - :toot:
//
//  Notes:
//    Find more script examples at https://github.com/github/hubot/blob/master/docs/scripting.md


'use strict';

const prStatus = require('./action/prStatus');

module.exports = function (robot) {

  /*************/
  /* PR Status */
  /*************/

  robot.hear(/pr status/i, res => {
    res.send('Let me look that up for ya...');
    prStatus(res)
      .then(
        // This is a hack to show the PR lines separately from the other message lines
        // There is currently a bug that any lines with links show from the generic "bot" id
        status => status.forEach(line => res.send(line))
      );
  });


  /********************/
  /* Celebratory Toot */
  /********************/

  robot.hear(/celebrat/i, (res) => res.send(':toot:'));
}
