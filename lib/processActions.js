// http://pm2.keymetrics.io/docs/usage/process-actions/
const pmx = require('pmx');

const processActions = {
  setPm2Action,
}

function setPm2Action(actionName, fn, ...params) {
  fn(...params);

  pmx.action(actionName, (param, reply) => {
    fn(...params);
    reply({ action: actionName, paramater: param });
  });
}

module.exports = processActions;
