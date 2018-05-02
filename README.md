## steamer-plugin

[![NPM Version](https://img.shields.io/npm/v/steamer-plugin.svg?style=flat)](https://www.npmjs.com/package/steamer-plugin)
[![Travis](https://img.shields.io/travis/steamerjs/steamer-plugin.svg)](https://travis-ci.org/steamerjs/steamer-plugin)
[![Deps](https://img.shields.io/david/steamerjs/steamer-plugin.svg)](https://david-dm.org/steamerjs/steamer-plugin)
[![Coverage](https://img.shields.io/coveralls/steamerjs/steamer-plugin.svg)](https://coveralls.io/github/steamerjs/steamer-plugin)

快速开发 [steamerjs](https://github.com/steamerjs/steamerjs) 插件的类，继承即可。
如何开发 steamerjs 插件，请参考 [steamer-plugin-example](https://github.com/steamerjs/steamer-plugin-example)

### 接口

#### 属性

* pluginName
    - `String`
    - required
    - 默认值: ""
    - 注册 `plugin` 名

#### 基础方法

* fs
    - `Function`
    - [fs-extra](https://www.npmjs.com/package/fs-extra)

* chalk
    - `Function`
    - [chalk](https://www.npmjs.com/package/chalk)

* _
    - `Object`
    - [lodash](https://www.npmjs.com/package/lodash)

#### 获取路径

* getGlobalModules
    - `Function`
    - 获取全局 node_modules 路径

* getGlobalHome
    -  `Function`
    - 获取全局 home 目录

#### 配置方法

* createConfig
    - `Function`
    - 创建 `steamer` 插件配置
    - 参数
        - `config`,  配置 object, 默认值为: {}
        - `options`, 参数对象
            - `option.folder`, `String`, .steamer 的父目录，
            - `option.filename`, `String` 具体的文件名
            - `option.extension`, `String` 默认值：js
            - `option.overwrite`, `Boolean` 是否覆盖已经存在的配置文件
            - `option.isGlobal`, `Boolean` 是否全局

* readConfig
    - `Function`
    - 读取 `steamer` 插件配置
    - 参数
        - `options`, 参数对象
            - `option.folder`, `String`, .steamer 的父目录，
            - `option.filename`, `String` 具体的文件名
            - `option.extension`, `String` 默认值：js
            - `option.isGlobal`, `Boolean` 是否全局

* createSteamerConfig
    - `Function`
    - 创建 `steamerjs` 配置
    - 参数
        - `config`,  配置 object, 默认值为: {}
        - `options`, 参数对象
            - `option.folder`, `String`, .steamer 的父目录，
            - `option.overwrite`, `Boolean` 是否覆盖已经存在的配置文件
            - `option.isGlobal`, `Boolean` 是否全局

* readSteamerDefaultConfig
    - `Function`
    - 读取 `steamerjs` 配置与默认配置的并集
    - 默认值
    ```javascript
    NPM: 'npm',
    PLUGIN_PREFIX: 'steamer-plugin-',
    KIT_PREFIX: 'steamer-kit-',
    TEAM_PREFIX: 'steamer-team-'
    ```

* readSteamerConfig
    - `Function`
    - 读取 `steamerjs` 配置
    - 参数
        - `options`, 参数对象
            - `option.isGlobal`, `Boolean` 是否全局

#### 命令输出

* log
    - `Function`
    - 输出文本
    - 参数
        - `str`, 文本
        - `color`, 颜色, 默认 `white`

* error
    - `Function`
    - 输出报错
    - 参数
        - `str`, 文本

* info
    - `Function`
    - 输出信息
    - 参数
        - `str`, 文本

* warn
    - `Function`
    - 输出警告
    - 参数
        - `str`, 文本

* success
    - `Function`
    - 输出成本信息
    - 参数
        - `str`, 文本

* printTitle
    - `Function`
    - 输出标题
    - 参数
        - `str`, 文本
        - `color`, 颜色, 默认 `white`

```javascript
// 例子
================================ Command Usage ================================
```

* printEnd
    - `Function`
    - 输出末尾
    - 参数
        - `str`, 文本
        - `color`, 颜色, 默认 `white`

```javascript
// 例子
================================================================================
```

* printUsage
    - `Function`
    - 输出命令使用方法
    - 参数
        - `description`, 命令描述
        - `cmd`, 命令名称

```javascript
// 例子
usage:
steamer doctor    help you check steamer running environment!!!
```

* printOption
    - `Function`
    - 输出命令参数
    - 参数
        - `options`, 参数数组
            - `option.option`, 参数名
            - `option.alias`, 参数别名
            - `option.value`, 参数值

```javascript
// 例子
options:
    --help, -h                    123
    --ak, -a                      456
    --plugin, -p <plugin name>    789
    --help                        123
```

### 开发及测试

```javascript
// 用于全局进行代码清理
npm i -g eslint
npm run lint

// 用于测试
npm test
```