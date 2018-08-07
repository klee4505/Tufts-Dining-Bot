var processMessage = require('../helpers/processMessage');

module.exports = (request, response) => {
	if (request.body.object === 'page') {
		request.body.entry.forEach(entry => {
			entry.messaging.forEach(event => {
				if (event.message && event.message.text) {
					processMessage(event);
				}
			});
		});
		response.status(200).end();
	}
};