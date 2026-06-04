const semver = require('semver');
const { engines } = require('./package.json');
const version = engines.node;

if (!semver.satisfies(process.version, version)) {
	throw new Error(console.error(`The current node version ${console.error(process.version)} does not satisfy the required version ${console.error(version)}.`));
}
