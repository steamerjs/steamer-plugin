const os = require('os');
const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const _ = require('lodash');

const DEFAULT_CONFIG = {
    NPM: 'npm',
    PLUGIN_PREFIX: 'steamer-plugin-',
    KIT_PREFIX: 'steamer-kit-',
    TEAM_PREFIX: 'steamer-team-'
};

class SteamerPlugin {
    constructor() {
        this.fs = fs;
        this.chalk = chalk;
        this._ = _;
        this.pluginName = _.kebabCase(SteamerPlugin.name);
        this.defaultConfig = DEFAULT_CONFIG;
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

        if (env.NODE_PATH && env.NODE_PATH !== 'undefined') {
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
        let folder = (option.isGlobal) ? this.getGlobalHome() : (option.folder || process.cwd());
        let filename = option.filename || this.pluginName;
        let extension = option.extension || 'js';
        let overwrite = option.overwrite || false; // overwrite the config file or not

        let configFile = path.resolve(path.join(folder, '.steamer/' + filename + '.' + extension));

        if (!overwrite && this.fs.existsSync(configFile)) {
            throw new Error(configFile + ' exists');
        }

        this._writeFile(configFile, filename, config);
    }

    /**
	 * read config file, local config extends global config
	 * @param  {Object} config [config object]
	 * @param  {Object} option [options]
	 */
    readConfig(option = {}) {
        let folder = option.folder || process.cwd();
        let filename = option.filename || this.pluginName;
        let extension = option.extension || 'js';
        let isGlobal = option.isGlobal || false;

        let globalConfigFile = path.resolve(path.join(this.getGlobalHome(), '.steamer/' + filename + '.' + extension));
        let globalConfig = this._readFile(globalConfigFile);

        if (isGlobal) {
            return globalConfig;
        }

        let localConfigFile = path.resolve(path.join(folder, '.steamer/' + filename + '.' + extension));
        let localConfig = this._readFile(localConfigFile);

        return _.merge({}, globalConfig, localConfig);
    }

    /**
	 * read steamerjs config, local config extends global config
	 * @return {Object}           [steamer config]
	 */
    readSteamerConfig(option = {}) {
        let isGlobal = option.isGlobal || false;

        let globalConfigFile = path.join(this.getGlobalHome(), '.steamer/steamer.js');
        let globalConfig = this._readFile(globalConfigFile);

        if (isGlobal) {
            return globalConfig;
        }

        let localConfigFile = path.join(process.cwd(), '.steamer/steamer.js');
        let localConfig = this._readFile(localConfigFile);

        return _.merge({}, globalConfig, localConfig);
    }

    /**
     * read steamerjs config default config merge with value from steamerSteamerConfig
     */
    readSteamerDefaultConfig() {
        return this._.merge({}, this.defaultConfig, this.readSteamerConfig());
    }

    /**
	 * create steamerjs config
	 */
    createSteamerConfig(config = {}, options = {}) {
        let folder = (options.isGlobal) ? this.getGlobalHome() : process.cwd();
        let overwrite = options.overwrite || false;

        let configFile = path.join(folder, '.steamer/steamer.js');

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
        let config = {};

        try {
            // 获取真实路径
            filepath = fs.realpathSync(filepath);
            if (require.cache[filepath]) {
                delete require.cache[filepath];
            }

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
        let extension = path.extname(filepath);
        let isJs = extension === '.js';
        let newConfig = {
            plugin: plugin,
            config: config
        };
        let contentPrefix = (isJs) ? 'module.exports = ' : '';
        let contentPostfix = (isJs) ? ';' : '';
        let content = contentPrefix + JSON.stringify(newConfig, null, 4) + contentPostfix;

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
        this.log(str, 'cyan');
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
    printTitle(strParam, color = 'white') {
        let msg = '';
        let str = ' ' + strParam + ' ';
        let len = str.length;
        let maxLen = process.stdout.columns || 84;

        let padding = '='.repeat(Math.floor((maxLen - len) / 2));

        msg += padding + str + padding;

        return this.log(msg, color);
    }

    /**
	 * print end message
	 * @param  {String} color [color name]
	 * @return {String}       [msg with color]
	 */
    printEnd(colorParam) {
        let msg = '';
        let color = colorParam || 'white';
        let maxLen = process.stdout.columns || 84;

        msg += '='.repeat(maxLen);

        return this.log(msg, color);
    }

    /**
	 * print command usage
	 * @param  {String} description [description of the command]
	 * @param  {String} cmd         [command name]
	 * @return {String}             [message]
	 */
    printUsage(description, cmdParam) {
        let msg = chalk.green('\nusage: \n');
        let cmd = cmdParam || this.pluginName.replace(this.pluginPrefix, '');

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
    printOption(optionsParam) {
        let options = optionsParam || [];

        let maxColumns = process.stdout.columns || 84;
        let maxOptionLength = 0;

        let msg = chalk.green('options: \n');

        options.map((item) => {
            let option = item.option || '';
            let alias = item.alias || '';
            let value = item.value || '';

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

        options.forEach((item) => {
            item.msg += item.description + '\n';

            msg += item.msg;
        });

        this.info(msg);
    }
}

module.exports = SteamerPlugin;