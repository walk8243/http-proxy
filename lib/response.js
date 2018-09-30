const statusMessages = require('../data/statusMessage');

const response = {
  sendStatus,
};

function sendStatus(res, status) {
  res.writeHead(status, statusMessages[status]);
  res.end();
}

module.exports = response;
