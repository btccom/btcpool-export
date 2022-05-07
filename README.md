BTCPool算力导出工具
===================

用 github pages 服务创建的BTCPool数据导出工具，通过调用矿池 API 实现数据获取。

访问：https://btccom.github.io/btcpool-export/

### 如何构建

该项目不需要构建，直接修改 app.jsx，然后推送到 github，就能在 https://btccom.github.io/btcpool-export/ 看到更新。

https://btccom.github.io/btcpool-export/index-debug.html 可用于调试。

### 前端技术栈

使用了 [React](https://github.com/facebook/react) 和 [AmazeUI](https://github.com/amazeui)。

不过该项目是完全自包含的，版本库里已经包含了 app.jsx 运行所需的所有文件，不会加载外部资源。

只要你不进行依赖版本更新，就不需要关注上游项目。
