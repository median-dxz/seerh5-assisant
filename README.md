# seerh5-assistant

赛尔号 H5 端登陆器 && api 封装接口

目前处于alpha阶段。

Attention:

**IMPORTANT：项目全部开源，仅供学习使用，禁止用于任何商业和非法行为。项目内全部功能不涉及付费相关和 pvp 相关，项目内全部通信仅涉及淘米官方服务器，不涉及任何第三方。**

# API DOC

还未编写，且构建配置为打包为 web app，因此 ES module 暴露的接口只在开发环境下有效，目前构建后的接口只有手动建立 window 下的全局变量，详见源代码。

# 版本号说明

## 1.0之前

`0`.`主版本(大型架构更改/功能添加)`.`次版本(功能点实现)`.`修补版本(几次完整的commit)`

## 1.0之后

采取semver标准

# 路线图 (Road Map)

- [x] 0.1.8-0.1.1x 版本将整体重构为**TypeScript**, 并进行代码结构和逻辑优化
- [x] 0.2.0 版本将使用自定的 logger 模块
- [x] 0.2.x 版本将进行初步的 UI 设计（暂不支持配置读写保存相关内容）
- [ ] 0.3.x 版本将维护一个数据源组件和一个对关键数据进行双向绑定的init模块，且重构之前的面板，使之获取与更新数据的编写更为简洁优雅，同时维护存于cache中的配置（暂不考虑rfc）
- [ ] 0.4.x 版本将使项目具有一定可用性，可以在生产环境使用（不考虑动态加载模组功能）
- [ ] 0.5.x 版本将重构迁移至**electron**，使用node.js提供的文件api能力进行配置文件，模组等内容的读写
- [ ] 0.6.x 版本将完成模组编写的库分发配置，届时考虑在electron版本的生成环境下开放模组sdk环境进行编写，调试和加载
- [ ] 1.0.0 编写一份文档

# 如何运行

目前最方便的使用方式是直接在在开发调试服务器内运行整个服务，不仅支持hmr，而且编写模组时有完整的编辑器（vsc）支持。

想要在开发服务器上运行，请clone仓库，然后运行：

```bash
npm i
npm run start
```

开发服务器会在`localhost:1234`上运行。

暂无任何 release，请手动构建。

clone 该项目代码，运行：

```bash
npm i
npm run build
```

而后在 dist 文件下得到输出，该输出使用 webpack 打包，目前配置下会将预置的模组全部打包进去。

输出后需要一个代理服务器进行代理，而后通过 localhost 进行访问，代理服务器需要**webpack.proxy.js**中的代理中间件方可运行。

默认运行时没有使用 babel 转换！要求尽可能高版本的浏览器，至少全面支持 es6/7。

# 技术栈

React + mui 负责界面，webpack 打包

api 部分使用原生 es module 编写，封装 seerh5.61.com 暴露出的接口，通过操作这些接口实现登陆器相关功能。

# 开源协议

**MPL-2.0**

并确保您遵守了 **eula** 中的开发者条款
