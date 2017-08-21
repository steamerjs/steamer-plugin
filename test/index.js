'use strict';

const path = require('path'),
	os = require('os'),
	fs = require('fs-extra'),
	chalk = require('chalk'),
	expect = require('chai').expect,
	sinon = require('sinon'),
	globalModules = require('global-modules');

const Plugin = require('../dist/index').default;

describe('get paths', function() {
	it('getGlobalModules - NODE_PATH not set', function() {
		let NODE_PATH = process.env.NODE_PATH;

		process.env.NODE_PATH = '';

		var plugin = new Plugin();

		expect(globalModules).to.equal(plugin.getGlobalModules());

		process.env.NODE_PATH = NODE_PATH;
	});

	it('getGlobalModules - NODE_PATH set', function() {
		let NODE_PATH = process.env.NODE_PATH;

		process.env.NODE_PATH = '/Users/steamer/';

		var plugin = new Plugin();

		expect(process.env.NODE_PATH).to.equal(plugin.getGlobalModules());

		process.env.NODE_PATH = NODE_PATH;
	});

	it('getGlobalHome', function() {
		var plugin = new Plugin();

		expect(os.homedir()).to.equal(plugin.getGlobalHome());
	});
});

describe.only('config', function() {

	var globalConfig = {};

	before(function() {
		fs.writeFileSync(path.join(process.cwd(), '.steamer/steamer-plugin-abc.js'));
		fs.writeFileSync(path.join(process.cwd(), '.steamer/steamer-plugin-bcd.js'));
	});

	after(function() {
		fs.removeSync(path.join(process.cwd(), '.steamer/steamer-plugin.js'));
		fs.removeSync(path.join(process.cwd(), '.steamer/steamer-plugin-xxx.json'));
		fs.removeSync(path.join(process.cwd(), '.steamer/steamer-plugin-abc.js'));
		fs.removeSync(path.join(process.cwd(), '.steamer/steamer-plugin-bcd.js'));
		fs.removeSync(path.join(process.cwd(), '.steamer/steamer.js'));
	});

	it('create and read - default', function() {

		var plugin = new Plugin(),
			config = {
				a: 1,
				b: 2
			};

		plugin.createConfig(config);

		expect(plugin.readConfig()).deep.eql(config);

	});

	it('create and read - json', function() {

		var plugin = new Plugin(),
			config = {
				a: 1,
				b: 2
			},
			options = {
				filename: 'steamer-plugin-xxx',
				extension: 'json'
			};

		plugin.createConfig(config, options);

		expect(plugin.readConfig(options)).deep.eql(config);
	});

	it('create and read - file exist', function() {

		var plugin = new Plugin(),
			config = {
				a: 1,
				b: 2
			},
			options = {
				filename: 'steamer-plugin-abc',
			};

		expect(function() {
			plugin.createConfig(config, options);
		}).to.throw();
	});

	it('create and read - file exist but overwrite', function() {

		var plugin = new Plugin(),
			config = {
				a: 1,
				b: 2
			},
			options = {
				filename: 'steamer-plugin-bcd',
				overwrite: true,
			};

		plugin.createConfig(config, options);

		expect(plugin.readConfig(options)).deep.eql(config);
	});

	it('create and read - global and local', function() {

		var plugin = new Plugin(),
			config = {
				a: 1,
				b: 2
			},
			options = {
				filename: 'steamer-plugin-def',
				overwrite: true
			};

		plugin.createConfig(config, options);

		config.a = 3;
		config.c = 3;
		options.isGlobal = true;

		plugin.createConfig(config, options);

		expect(plugin.readConfig(options)).deep.eql({
			a: 1,
			b: 2,
			c: 3
		});

		fs.removeSync(path.join(process.cwd(), '.steamer/steamer-plugin-def.js'));
		fs.removeSync(path.join(plugin.getGlobalHome(), '.steamer/steamer-plugin-def.js'));
	});

	it('steamer config create and read - global and local', function() {
		var plugin = new Plugin();

		// backup global steamer config
		globalConfig = plugin._readFile(path.join(plugin.getGlobalHome(), '.steamer/steamer.js'));

		var config = {
				a: 1,
				b: 2
			},
			options = {
				overwrite: true
			};

		plugin.createSteamerConfig(config, options);

		config.a = 3;
		config.c = 3;
		options.isGlobal = true;
		plugin.createSteamerConfig(config, options);

		expect(plugin.readSteamerConfig()).deep.eql({
			a: 1,
			b: 2,
			c: 3
		});

		plugin.createSteamerConfig(globalConfig, options);
	});
});