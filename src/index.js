'use strict';

const os = require('os'),
	  path = require('path'),
	  fs = require('fs-extra'),
	  chalk = require('chalk'),
	  _ = require('lodash'),
	  spawn = require('cross-spawn');

export default class SteamerPlugin {
	constructor() {
		this.fs = fs;
		this.chalk = chalk;
		this._ = _;
		this.pluginName = _.kebabCase(SteamerPlugin.name);
	}

	init() {
		this.warn('You do not write any ini logics.');
	}

	help() {
		this.warn('You do not add any help content.');
	}

	version() {

	}

	/**
	 * get global node_modules path
	 * @returns {String}
	 */
	getGlobalModules() {
		let env = process.env;

		if (env.NODE_PATH) {
			return env.NODE_PATH;
		}

		let globalModules = require('global-modules');

		if (this.fs.existsSync(globalModules)) {
			return globalModules;
		}

		// No Longer Support Compatible Mode
		return null;
	}

	/**
	 * get global home dir
	 * @returns {String}
	 */
	getGlobalHome() {
		return os.homedir() || process.cwd();
	}

	/**
	 * Create config file
	 * @param  {Object} config [config object]
	 * @param  {Object} option [options]
	 */
	createConfig(config = {}, option = {}) {
		// config file path: [folder]./steamer/[filename].[extension]
		var folder = (option.isGlobal) ? this.getGlobalHome() : (option.folder || process.cwd()),
			filename = option.filename || this.pluginName,
			extension = option.extension || 'js',
			overwrite = option.overwrite || false; // overwrite the config file or not

		var configFile = path.resolve(path.join(folder, '.steamer/' + filename + '.' + extension));

		if (!overwrite && this.fs.existsSync(configFile)) {
			throw new Error(configFile + ' exists');
		}

		this._writeFile(configFile, filename, config);

		this.config = null;
	}

	/**
	 * read config file, local config extends global config
	 * @param  {Object} config [config object]
	 * @param  {Object} option [options]
	 */
	readConfig(option = {}) {
		var folder = option.folder || process.cwd(),
			filename = option.filename || this.pluginName,
			extension = option.extension || 'js';

		var globalConfigFile = path.resolve(path.join(this.getGlobalHome(), '.steamer/' + filename + '.' + extension)),
			localConfigFile = path.resolve(path.join(folder, '.steamer/' + filename + '.' + extension));

		var globalConfig = this._readFile(globalConfigFile),
			localConfig = this._readFile(localConfigFile);

		this.config = _.merge({}, globalConfig, localConfig);

		return this.config;
	}

	/**
	 * read steamerjs config, local config extensd global config
	 * @return {Object}           [steamer config]
	 */
	readSteamerConfig() {
		let localConfigFile = path.join(process.cwd(), '.steamer/steamer.js'),
			globalConfigFile = path.join(this.getGlobalHome(), '.steamer/steamer.js');

		let localConfig = this._readFile(localConfigFile),
			globalConfig = this._readFile(globalConfigFile);

		var config = _.merge({}, globalConfig, localConfig);

		return config;
	}

	/**
	 * create steamerjs config
	 */
	createSteamerConfig(config, options) {
		var config = config || {},
			options = options || {};

		var folder = (options.isGlobal) ? this.getGlobalHome() : process.cwd(),
			overwrite = options.overwrite || false;

		var configFile = path.join(folder, '.steamer/steamer.js');

		try {
			if (!overwrite && this.fs.existsSync(configFile)) {
				throw new Error(configFile + ' exists');
			}
			this._writeFile(configFile, 'steamerjs', config);
		}
		catch (e) {
			this.error(e.stack);
			throw e;
		}
	}

	/**
	 * read config file
	 * @param  {String} filepath  [file path]
	 * @return {Object}           [config object]
	 */
	_readFile(filepath) {
		var config = {};

		try {
			if (require.cache[filepath]) {
				delete require.cache[filepath];
			}

			Object.keys(require.cache).forEach(function(key) {
				if (key.includes(filepath)) {
					delete require.cache[key];
				}
			});

			config = require(filepath) || {};
			config = config.config;
		}
		catch (e) {
			return config;
		}

		return config;
	}

	/**
	 * write config file
	 * @param  {String} filepath [config file path]
	 * @param  {Object|String}          [config content]
	 */
	_writeFile(filepath, plugin, config) {
		var extension = path.extname(filepath);
		var isJs = extension === '.js',
			newConfig = {
				plugin: plugin,
				config: config
			},
			contentPrefix = (isJs) ? 'module.exports = ' : '',
			contentPostfix = (isJs) ? ';' : '',
			content = contentPrefix + JSON.stringify(newConfig, null, 4) + contentPostfix;

		try {
			this.fs.ensureFileSync(filepath);
			this.fs.writeFileSync(filepath, content, 'utf-8');
		}
		catch (e) {
			throw e;
		}
	}

	/**
	 * log things
	 * @param str
	 * @param color
	 * @returns {String}
	 */
	log(str, color = 'white') {
		str = str || '';
		str = _.isObject(str) ? JSON.stringify(str) : str;
		let msg = chalk[color](str);

		console.info(msg);
		return msg;
	}

	/**
	 * print errors
	 * @param str
	 */
	error(str) {
		this.log(str, 'red');
	}

	/**
	 * print infos
	 * @param str
	 */
	info(str) {
		this.log(cyan, 'red');
	}

	/**
	 * print warnings
	 * @param str
	 */
	warn(str) {
		this.log(str, 'yellow');
	}

	/**
	 * pring success info
	 * @param str
	 */
	success(str) {
		this.log(str, 'green');
	}

	/**
	 * print title message
	 * @param  {String} color [color name]
	 * @return {String}       [msg with color]
	 */
	printTitle(str, color) {
		var msg = '',
			color = color || 'white',
			str = ' ' + str + ' ',
			len = str.length,
			maxLen = process.stdout.columns || 84;

		var padding = '='.repeat(Math.floor((maxLen - len) / 2));

		msg += padding + str + padding;

		return this.log(msg, color);
	}

	/**
	 * print end message
	 * @param  {String} color [color name]
	 * @return {String}       [msg with color]
	 */
	printEnd(color) {
		var msg = '',
			color = color || 'white',
			maxLen = process.stdout.columns || 84;

		msg += '='.repeat(maxLen);

		return this.log(msg, color);
	}

	/**
	 * print command usage
	 * @param  {String} description [description of the command]
	 * @param  {String} cmd         [command name]
	 * @return {String}             [message]
	 */
	printUsage(description, cmd) {
		var msg = chalk.green('\nusage: \n'),
			cmd = cmd || this.pluginName.replace(this.pluginPrefix, '');

		msg += 'steamer ' + cmd + '    ' + description + '\n';
		this.info(msg);
	}

	/**
	 * print command option
	 * @param  {Array} options  [array of options]
	 - option  		{String}    full option
	 - alias   		{String}    option alias
	 - value   		{String}    option alias
	 - description  	{String}    option description
	 * @return {String}         [message]
	 */
	printOption(options) {
		var options = options || [];

		var maxColumns = process.stdout.columns || 84,
			maxOptionLength = 0;

		var msg = chalk.green('options: \n');

		options.map((item) => {
			let option = item.option || '',
				alias = item.alias || '',
				value = item.value || '';

			let msg = '    --' + option;

			msg += (alias) ? ', -' + alias : '';
			msg += (value) ? ' ' + value : '';

			item.msg = msg;

			let msgLen = msg.length;

			maxOptionLength = (msgLen > maxOptionLength) ? msgLen : maxOptionLength;

			return item;
		});

		options.map((item) => {
			let length = item.msg.length;

			let space = ' '.repeat(maxOptionLength - length);

			item.msg = item.msg + space + '    ';

			return item;
		});

		options.map((item) => {
			item.msg += item.description + '\n';

			msg += item.msg;
		});

		this.info(msg);
	};
};