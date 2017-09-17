'use strict';

const path = require('path'),
	os = require('os'),
	fs = require('fs-extra'),
	chalk = require('chalk'),
	expect = require('chai').expect,
	sinon = require('sinon'),
	globalModules = require('global-modules');

const Plugin = require('../dist/index').default;

describe('[get paths]', function() {
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

describe('[config]', function() {
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
		
		let stub1 = sinon.stub(plugin.fs, 'ensureFileSync').returnsArg(0);
		let stub2 = sinon.stub(plugin.fs, 'writeFileSync').returnsArg(0);
		
		plugin.createConfig(config);

		let configPath = path.resolve('./.steamer/steamer-plugin.js'),
			configContent = `module.exports = ${JSON.stringify({
				plugin: 'steamer-plugin',
				config
			}, null, 4)};`;
		
		sinon.assert.calledWithMatch(stub2, configPath, configContent);
		
		stub1.restore();
		stub2.restore();
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

		let stub1 = sinon.stub(plugin.fs, 'ensureFileSync').returnsArg(0);
		let stub2 = sinon.stub(plugin.fs, 'writeFileSync').returnsArg(0);
		
		plugin.createConfig(config, options);

		let configPath = path.resolve('./.steamer/steamer-plugin-xxx.js'),
			configContent = `${JSON.stringify({
				plugin: 'steamer-plugin-xxx',
				config
			}, null, 4)}`;
		
		sinon.assert.calledWithMatch(stub2, configPath, configContent);
		
		stub1.restore();
		stub2.restore();
	});

	it('create and read - file exist', function() {
		var plugin = new Plugin(),
			config = {
				a: 1,
				b: 2
			},
			options = {
				filename: 'steamer-plugin-abc'
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
				overwrite: true
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
		
		options.isGlobal = false;
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
		
		options.isGlobal = false;
		expect(plugin.readSteamerConfig()).deep.eql({
			a: 1,
			b: 2,
			c: 3
		});

		plugin.createSteamerConfig(globalConfig, options);
	});
});

describe.only('[log]', function() {
	let log,
	 	plugin = new Plugin();

	before(function() {
		log = sinon.stub(console, 'info');
	});

	after(function() {
		log.restore();
	});
	
	it('error', function() {
		plugin.error('des');
	
		let msg = chalk.red('des');
	
		expect(console.info.calledWith(msg)).to.be.eql(true);
	});

	it('info', function() {
		plugin.info('des');
	
		let msg = chalk.cyan('des');
	
		expect(console.info.calledWith(msg)).to.be.eql(true);
	});

	it('warn', function() {
		plugin.warn('des');
	
		let msg = chalk.yellow('des');
	
		expect(console.info.calledWith(msg)).to.be.eql(true);
	});

	it('success', function() {
		plugin.success('des');
	
		let msg = chalk.green('des');
	
		expect(console.info.calledWith(msg)).to.be.eql(true);
	});

});