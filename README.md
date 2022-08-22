# seerh5-assisant

赛尔号H5端登陆器 && api封装接口

目前处于初始阶段。

**IMPORTANT：项目全部开源，仅供学习使用，禁止用于任何商业和非法行为。项目内全部功能不涉及付费相关和pvp相关，项目内全部通信仅涉及淘米官方服务器，不涉及任何第三方。**

# API DOC

还未编写，且构建配置为打包为web app，因此ES module暴露的接口只在开发环境下有效，目前构建后的接口只有手动建立window下的全局变量，详见源代码。

# 路线图 (Road Map)

- [x] 0.1.7将修复部分Bug，以及适配新的8/19版本（背包更新）
- [ ] 0.1.8-0.1.10版本将整体重构为**TypeScript**, 并进行代码结构和逻辑优化
    - 重构event模块
    - 优化const模块逻辑
    - 优化entity模块
    - 优化loader逻辑
    - 优化pethelper模块，集中整合pet相关操作
    - [ ] 优化battlemodule模块
    - [ ] 优化utils模块
    - [ ] mods

- [ ] 0.2.0版本进行初步的界面UI设计

# 如何运行

暂无任何release，请手动构建

clone该项目代码，运行：

```bash
npm i
npm run build
```

而后在dist文件下得到输出，该输出使用webpack打包，目前配置下会将预置的模组全部打包进去。

输出后需要一个代理服务器进行代理，而后通过localhost进行访问，代理服务器需要**webpack.proxy.js**中的代理中间件方可运行。

默认运行时没有使用babel转换！要求尽可能高版本的浏览器，至少全面支持es6/7。

# 技术栈

React + mui 负责界面，webpack打包

api部分使用原生es module编写，封装seerh5.61.com暴露出的接口，通过操作这些接口实现登陆器相关功能。

# 开源协议

MPL-2.0

并确保您遵守了eula中的开发者条款