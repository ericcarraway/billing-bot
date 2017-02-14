//  Description:
//    automates :allthethings: for the San Antonio team
//
//  Dependencies:
//
//
//  Configuration:
//    HUBOT_SLACK_TOKEN - Coach Botovich's Slack API Token
//
//  Commands:
//    hello coach
//
//  Notes:
//    Find more script examples at https://github.com/github/hubot/blob/master/docs/scripting.md


'use strict';

module.exports = function (robot) {
    // our first command...
    robot.hear(/hello coach/i, (res) => res.send('hello world'));

    // listen for 'blocked|blocker', ping a project manager
    robot.hear(/blocked|blocker/i, (res) => res.send('Did one of my players just get blocked? Should I put a PM in the game?'));
}
