const hapNodejs = require('hap-nodejs');
const shellJs = require('shelljs');
const simpleGitPromiseClass = require('simple-git/promise');
const packageJson = require('../package.json');

const platformName = 'homebridge-github-backup';
const platformPrettyName = 'Github Backuper';

let hap;

module.exports = (homebridge) => {
	hap = homebridge.hap;

	homebridge.registerPlatform(platformName, platformPrettyName, BackuperPlatform, true);
};

class BackuperPlatform {
	constructor(log, config) {
		this.log = log;
		this.config = config;

		this.log.info(`Github Backuper Plugin Loaded - version ${packageJson.version}`);
	}

	accessories(callback) {
		callback([
			new Backuper(hap, this.log, this.config),
		]);
	}
}

class Backuper {
	constructor(hap, log, config) {
		this.log = log;
		this.config = config;
		this.name = platformPrettyName;

		this.switchService = new hap.Service.Switch(platformPrettyName);
		this.switchService.getCharacteristic(hap.Characteristic.On)
			.on(hapNodejs.CharacteristicEventTypes.GET, (callback) => {
				callback(undefined, false);
			})
			.on(hapNodejs.CharacteristicEventTypes.SET, (value, callback) => {
				this.backup();
				callback();
			});

		this.informationService = new hap.Service.AccessoryInformation()
			.setCharacteristic(hap.Characteristic.Manufacturer, "Jakub Pilař")
			.setCharacteristic(hap.Characteristic.Model, platformPrettyName);
	}

	backup() {
		const originName = 'origin';

		this.log.info("Starting backup!");
		const date = new Date();
		const tempDirectory = `/tmp/homebridge-backup-${date.getTime()}`;

		if (!shellJs.test('-d', tempDirectory)) {
			shellJs.mkdir(tempDirectory);
		}
		shellJs.cd(tempDirectory);

		const simpleGitPromise = simpleGitPromiseClass(tempDirectory);

		const username = this.config.githubUsername;
		const password = this.config.githubPassword;
		const repo = this.config.githubRepository;
		const email = this.config.githubEmail;
		const name = this.config.githubName;
		const filesToBackup = this.config.filesToBackup;
		const branch = this.config.branch || 'main';
		const connectMethod  = this.config.connectMethod || "https";

		let gitHubUrl = `https://${username}:${password}@github.com/${repo}`;
		if(connectMethod == 'ssh'){
			gitHubUrl = `git@github.com:${repo}`;
		}

		if (!filesToBackup || !Array.isArray(filesToBackup)) {
			this.log.error('Missing array filesToBackup in config.');
			return;
		}

		const missingFiles = filesToBackup.filter((file) => !shellJs.test('-e', file));
		if (missingFiles.length) {
			this.log.error('There are some non-existing files.');
			this.log.error(missingFiles);
			return;
		}

		simpleGitPromise.checkIsRepo()
			.then(isRepo => !isRepo && simpleGitPromise.init().then(() => simpleGitPromise.addRemote(originName, gitHubUrl)))
			.then(() => simpleGitPromise.addConfig('user.email', email))
			.then(() => simpleGitPromise.addConfig('user.name', name))
			.then(() => simpleGitPromise.fetch())
			.then(() => simpleGitPromise.pull(originName, branch, {'--ff': null}))
			.then(() => simpleGitPromise.branch(['-M', `${branch}`]))
			.then(() => simpleGitPromise.reset('hard', `${originName}/${branch}`))
			.then(
				// copy files to backup
				() => shellJs.cp('-R', filesToBackup, tempDirectory)
			).then(
				() => simpleGitPromise.add('.')
					.then(
						() => {
						},
						(failed) => {
							this.log.error('Adding files failed.');
							this.log.error(failed);
						}
					)
			).then(
				() => simpleGitPromise.commit(`Backup ${date.toUTCString()}`)
					.then(
						(success) => {
							this.log(success);
						},
						(failed) => {
							this.log.error('Failed commit.');
							this.log.error(failed);
						}
					)
			).then(
				() => simpleGitPromise.push(originName, branch)
					.then(
						(success) => this.log.info('Successfully pushed backup!') && this.log(success),
						(failed) => {
							this.log.error('Push failed.');
							this.log.error(failed);
						}
					)
			).then(
				// remove temporary directory
				() => shellJs.rm('-rf', tempDirectory)
			);
	}

	getServices = () => [
		this.informationService,
		this.switchService,
	];
}
