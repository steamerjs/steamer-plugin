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

describe('config', function() {
  var globalConfig = {};

  before(function() {
    fs.writeFileSync(path.join(process.cwd(), '.steamer/steamer-plugin-abc.js'));
    fs.writeFileSync(path.join(process.cwd(), '.steamer/steamer-plugin-bcd.js'));
  });

  after(function() {
    fs.removeSync(path.join(process.cwd(), '.steamer/steamer-plugin.js'));
    // fs.removeSync(path.join(process.cwd(), '.steamer/steamer-plugin-xxx.json'));
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

    // stub ensureFileSync , not to create file
    sinon.stub(plugin.fs, 'ensureFileSync').returnsArg(0);
    // stub writeFileSync, not to implement writeFile
    let stub = sinon.stub(plugin.fs, 'writeFileSync').returnsArg(0);

    plugin.createConfig(config, options);
    // match function called params
    expect(stub.calledWithMatch(sinon.match(/steamer-plugin-xx/gi), sinon.match(/module.exports/gi)));
    stub.restore();
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

describe.only('print things: ', function() {
  var log,
    utils = new Plugin();

  beforeEach(function() {
    log = sinon.stub(console, 'info');
  });

  it('error', function() {
    utils.error('error');

    expect(console.info.calledOnce).to.be.true;
    expect(console.info.calledWith(chalk['red']('error'))).to.be.true;
    log.restore();
  });

  it('info', function() {
    utils.info('info');

    expect(console.info.calledOnce).to.be.true;
    expect(console.info.calledWith(chalk['cyan']('info'))).to.be.true;
    log.restore();
  });

  it('warn', function() {
    utils.warn('warn');

    expect(console.info.calledOnce).to.be.true;
    expect(console.info.calledWith(chalk['yellow']('warn'))).to.be.true;
    log.restore();
  });

  it('success', function() {
    utils.success('success');

    expect(console.info.calledOnce).to.be.true;
    expect(console.info.calledWith(chalk['green']('success'))).to.be.true;
    log.restore();
  });

  it('printTitle', function() {
    utils.printTitle('test3', 'white');

    var str = ' test3 ',
      len = str.length,
      maxLen = process.stdout.columns || 84;

    var padding = '='.repeat(Math.floor((maxLen - len) / 2));

    expect(console.info.calledOnce).to.be.true;
    expect(console.info.calledWith(chalk['white'](padding + str + padding))).to.be.true;
    log.restore();
  });

  it('printEnd', function() {
    utils.printEnd('white');

    var maxLen = process.stdout.columns || 84;

    expect(console.info.calledOnce).to.be.true;
    expect(console.info.calledWith(chalk['white']('='.repeat(maxLen)))).to.be.true;
    log.restore();
  });

  it('printOption', function() {
    let msg = [
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
        description: '123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123'
      }
    ];

    utils.printOption(msg);

    expect(console.info.calledOnce).to.be.true;
    // expect(console.info.calledWith(msg)).to.be.true;
    log.restore();
  });

  it('printUsage', function() {
    utils.printUsage('des');
    var msg = chalk.green('\nusage: \n');

    msg += chalk.cyan('steamer steamer-plugin' + '    ' + 'des' + '\n');

    expect(console.info.calledOnce).to.be.true;
    expect(console.info.calledWith(msg)).to.be.true;
    log.restore();
  });
});
