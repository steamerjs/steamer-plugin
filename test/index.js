const path = require('path');
const os = require('os');
const fs = require('fs-extra');
const chalk = require('chalk');
const expect = require('chai').expect;
const sinon = require('sinon');
const globalModules = require('global-modules');

const Plugin = require('../index');

describe('[get paths]', function() {
    it('getGlobalModules - NODE_PATH not set', function() {
        let NODE_PATH = process.env.NODE_PATH;

        process.env.NODE_PATH = '';

        let plugin = new Plugin();

        expect(globalModules).to.equal(plugin.getGlobalModules());

        process.env.NODE_PATH = NODE_PATH;
    });

    it('getGlobalModules - NODE_PATH set', function() {
        let NODE_PATH = process.env.NODE_PATH;

        process.env.NODE_PATH = '/Users/steamer/';

        let plugin = new Plugin();

        expect(process.env.NODE_PATH).to.equal(plugin.getGlobalModules());

        process.env.NODE_PATH = NODE_PATH;
    });

    it('getGlobalHome', function() {
        let plugin = new Plugin();

        expect(os.homedir()).to.equal(plugin.getGlobalHome());
    });
});

describe('[config]', function() {
    let globalConfig = {};

    before(function() {
        fs.ensureFileSync(path.join(process.cwd(), '.steamer/steamer-plugin-abc.js'));
        fs.ensureFileSync(path.join(process.cwd(), '.steamer/steamer-plugin-bcd.js'));
    });

    after(function() {
        fs.removeSync(path.join(process.cwd(), '.steamer/steamer-plugin.js'));
        fs.removeSync(path.join(process.cwd(), '.steamer/steamer-plugin-xxx.json'));
        fs.removeSync(path.join(process.cwd(), '.steamer/steamer-plugin-abc.js'));
        fs.removeSync(path.join(process.cwd(), '.steamer/steamer-plugin-bcd.js'));
        fs.removeSync(path.join(process.cwd(), '.steamer/steamer.js'));
    });

    it('create and read - default', function() {
        let plugin = new Plugin();
        let config = {
            a: 1,
            b: 2
        };

        let stub1 = sinon.stub(plugin.fs, 'ensureFileSync').returnsArg(0);
        let stub2 = sinon.stub(plugin.fs, 'writeFileSync').returnsArg(0);

        plugin.createConfig(config);

        let configPath = path.resolve('./.steamer/steamer-plugin.js');
        let configContent = `module.exports = ${JSON.stringify({
            plugin: 'steamer-plugin',
            config
        }, null, 4)};`;

        sinon.assert.calledWithMatch(stub2, configPath, configContent);

        stub1.restore();
        stub2.restore();
    });

    it('create and read - json', function() {
        let plugin = new Plugin();
        let config = {
            a: 1,
            b: 2
        };
        let options = {
            filename: 'steamer-plugin-xxx',
            extension: 'json'
        };

        let stub1 = sinon.stub(plugin.fs, 'ensureFileSync').returnsArg(0);
        let stub2 = sinon.stub(plugin.fs, 'writeFileSync').returnsArg(0);

        plugin.createConfig(config, options);

        let configPath = path.resolve('./.steamer/steamer-plugin-xxx.js');
        let configContent = `${JSON.stringify({
            plugin: 'steamer-plugin-xxx',
            config
        }, null, 4)}`;

        sinon.assert.calledWithMatch(stub2, configPath, configContent);

        stub1.restore();
        stub2.restore();
    });

    it('create and read - file exist', function() {
        let plugin = new Plugin();
        let config = {
            a: 1,
            b: 2
        };
        let options = {
            filename: 'steamer-plugin-abc'
        };

        expect(function() {
            plugin.createConfig(config, options);
        }).to.throw();
    });

    it('create and read - file exist but overwrite', function() {
        let plugin = new Plugin();
        let config = {
            a: 1,
            b: 2
        };
        let options = {
            filename: 'steamer-plugin-bcd',
            overwrite: true
        };

        plugin.createConfig(config, options);

        expect(plugin.readConfig(options)).deep.eql(config);
    });

    it('create and read - global and local', function() {
        let plugin = new Plugin();
        let config = {
            a: 1,
            b: 2
        };
        let options = {
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
        let plugin = new Plugin();

        // backup global steamer config
        globalConfig = plugin._readFile(path.join(plugin.getGlobalHome(), '.steamer/steamer.js'));

        let config = {
            a: 1,
            b: 2
        };
        let options = {
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

    it('readSteamerDefaultConfig - 1', function() {
        let plugin = new Plugin();

        let stub1 = sinon.stub(plugin, 'readSteamerConfig').callsFake(() => {
            return {
                NPM: 'tnpm',
                PLUGIN_PREFIX: 'at-plugin-',
                KIT_PREFIX: 'at-kit-',
                TEAM_PREFIX: 'at-team-'
            };
        });

        expect(plugin.readSteamerDefaultConfig()).deep.eql({
            NPM: 'tnpm',
            PLUGIN_PREFIX: 'at-plugin-',
            KIT_PREFIX: 'at-kit-',
            TEAM_PREFIX: 'at-team-'
        });

        stub1.restore();
    });

    it('readSteamerDefaultConfig - 2', function() {
        let plugin = new Plugin();

        let stub1 = sinon.stub(plugin, 'readSteamerConfig').callsFake(() => {
            return {
                GIT: 'github.com'
            };
        });

        expect(plugin.readSteamerDefaultConfig()).deep.eql({
            NPM: 'npm',
            PLUGIN_PREFIX: 'steamer-plugin-',
            KIT_PREFIX: 'steamer-kit-',
            TEAM_PREFIX: 'steamer-team-',
            GIT: 'github.com'
        });

        stub1.restore();
    });

});

describe('[log]', function() {
    let log;
    let plugin = new Plugin();

    beforeEach(function() {
        log = sinon.stub(console, 'info');
    });

    afterEach(function() {
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

    it('printTitle', function() {
        plugin.printTitle('test3', 'white');

        let str = ' test3 ';
        let len = str.length;
        let maxLen = process.stdout.columns || 84;

        let padding = '='.repeat(Math.floor((maxLen - len) / 2));

        expect(console.info.calledOnce).to.be.eql(true);
        expect(console.info.calledWith(chalk['white'](padding + str + padding))).to.be.eql(true);
    });

    it('printEnd', function() {
        plugin.printEnd('white');

        let maxLen = process.stdout.columns || 84;

        expect(console.info.calledOnce).to.be.eql(true);
        expect(console.info.calledWith(chalk['white']('='.repeat(maxLen)))).to.be.eql(true);
    });

    it('printUsage', function() {
        let des = 123;

        plugin.printUsage(des, 'test3');

        let msg = chalk.green('\nusage: \n');

        msg += 'steamer test3    ' + des + '\n';

        expect(console.info.calledOnce).to.be.eql(true);
        expect(console.info.calledWith(chalk['cyan'](msg))).to.be.eql(true);
    });

    it('printOption', function() {

        plugin.printOption([
            {
                option: 'del',
                alias: 'd',
                description: 'delete file'
            },
            {
                option: 'add',
                alias: 'a',
                description: 'add file'
            },
            {
                option: 'config',
                alias: 'c',
                description: 'set config'
            },
            {
                option: 'init',
                alias: 'i',
                value: '<kit name>',
                description: 'init starter kit name'
            },
            {
                option: 'random',
                alias: 'r',
                value: '<123123123123123123>',
                description: '1231231231231231231231231231231231231231231231231'
                    + '23123123123123123123123123123123123123123'
            }
        ]);

        expect(console.info.calledOnce).to.be.eql(true);
        // expect(console.log.calledWith(msg)).to.be.eql(true);
    });
});