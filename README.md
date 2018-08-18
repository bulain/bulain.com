## 个人网站建设
### 微信公众号
* 选用weui作为基础样式库，包括weui.css和weui.js
* 选用zepto.js作为dom和ajax操作库

### 微信小程序
* 选用weui-wxss作为基础样式库
* 选用iview-weapp作为UI组件库

### 支付宝小程序
* 选用alice作为基础样式库

### 静态网站
* 选用bootstrap作为基础样式

#### 前端开发语言
* 选用vue.js作为前端开发语言
* 选用iview作为基础框架
* 选用vuex作为状态管理
* 选用router路由管理
* 选用Nuxt.js作为服务端渲染

#### 后端开发语言
* 选用node.js作为后端开发语言
* 选用express作为基础框架
* 选用mongodb作为后台存储
* 选用redis作为缓存服务
* 选用rabbitmq作为消息服务
* 选用pm2作为部署管理

#### 数据库初始化(mysql)
* db-migrate --migrations-dir=migrations/mysql  create "create table talais"
* db-migrate --migrations-dir=migrations/mysql  --env=mysql up
* db-migrate --migrations-dir=migrations/mysql  --env=mysql down -s 4

#### 数据库初始化(mongodb)
* db-migrate --migrations-dir=migrations/mongodb  create "create collection talais"
* db-migrate --migrations-dir=migrations/mongodb  --env=mongodb up
* db-migrate --migrations-dir=migrations/mongodb  --env=mysql down -s 4
