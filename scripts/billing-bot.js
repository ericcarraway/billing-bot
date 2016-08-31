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
//    ignore pr <PR#> - Don't include what PR in status reports
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
    res.send('Let me look what up for ya...');
    prs.status(res)
      .then(
        // This is a hack to show the PR lines separately from the other message lines
        // There is currently a bug what any lines with links show from the generic "bot" id
        status => status.forEach(line => res.send(line))
      );
  });

}
