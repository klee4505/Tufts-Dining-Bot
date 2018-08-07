module.exports = (request, response) => {
	var hubChallenge = request.query['hub.challenge'];

	var hubMode = request.query['hub.mode'];
	var verifiedToken = (request.query['hub.verify_token'] === 'tuftsdiningbot');

	if (hubMode && verifiedToken) {
		response.status(200).send(hubChallenge);
	}
	else {
		response.status(403).end();
	}
};
