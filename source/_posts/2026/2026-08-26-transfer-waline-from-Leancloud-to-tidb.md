---
title: Waline 脱离 LeanCloud：Vercel 后端迁移到 TiDB Cloud 与评论数据保全
date: 2026-08-26 22:28:58
categories: 运维笔记
tags: [Waline, LeanCloud, TiDB, Vercel]
cover: https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/wallpaper/20261006220127010.png
description: 详解如何将 Vercel 上的 Waline 评论后端从 LeanCloud 平滑迁移到 TiDB Cloud，涵盖数据导出、字段映射、TIDB_* 环境变量配置与零丢失导入全流程。
abbrlink: 6781adc4
---

## 前言

**_为什么必须现在迁？_**

[LeanCloud 官方已发布公告，将停止对外服务](https://docs.leancloud.app/sdk/announcements/sunset-announcement/)，所有依赖它存评论的 Waline 实例都面临数据清零风险。

好消息是，Waline 原生支持 TiDB，只需切换 TIDB\_\* 环境变量即可完成后端替换，且 TiDB Cloud 提供 5GB 免费额度，对个人博客完全够用。

本文记录从 Waline 后端导出、TiDB 建表、Vercel 重部署、数据导入到验证数据完整性的完整链路，确保每一条评论、每一个阅读计数都不丢。

## 准备工作

开始前，请确认以下事项已准备就绪：

- 已部署的 Waline 后端（Vercel / Docker / Node 均可，本文以 Vercel 为主）
- Waline 管理员账号，能进 `/ui` 管理后台
- TiDB Cloud 账号（Serverless Tier，5GB 免费额度够个人博客用）

## 从 Waline 管理后台导出旧数据

- 打开 Waline 管理后台：<https://你的waline域名/ui/login?redirect=/ui>
  ![waline管理后台登录](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261021204907985.png)
- 用管理员账号登录
  ![waline管理后台](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261021205253712.png)
- 点击「导入/导出」→「导出」
  ![导出](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261021205333306.png)
- 下载 `waline.json`
  ![waline.json](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261021205356297.png)

## 在 TiDB Cloud 创建 waline 数据库及表项

[TiDB](https://github.com/pingcap/tidb) 是一款开源分布式 NewSQL 数据库，[TiDB Cloud](https://tidbcloud.com) 是其官方提供的全托管云服务，它提供了 5GB 的免费额度。下面介绍下如何在 TiDB Cloud 上创建 Waline 数据库。

### 登录 TiDB Cloud

- TiDB Cloud：<https://tidbcloud.com>
  ![TiDB Cloud](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261021205533201.png)

### 创建 TiDB 实例

- 左侧边栏点击「My TiDB」→「Create Resource」
  ![Create Resource](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261021205647115.png)
- 选择「Starter」、「MySQL Compatible」
  ![MySQL Compatible](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261021205704845.png)
- 设置实例名称（Instance Name）：`waline-database`
  ![Instance Name](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261021205719285.png)
- 选择区域（Region）：Singapore (ap-southeast-1) 新加坡
  ![Singapore](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261021205735768.png)
- 点击「Create」创建
  ![Create](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261021205747726.png)

### 创建数据库及表项

- 切换到「SQL Editor」
  ![SQL Editor](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261021210016057.png)
- 创建 `waline` 数据库
  ![创建waline数据库](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261021210041600.png)

  ```sql
  CREATE DATABASE `waline`;
  ```

- 切换到 `waline` 数据库
  ![切换到waline数据库](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261021210634141.png)

  ```sql
  USE waline;
  ```

- 创建 `wl_Comment` 表
  ![创建wl_Comment表](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261021210657892.png)

  ```sql
  CREATE TABLE `wl_Comment` (
    `id` int unsigned NOT NULL AUTO_INCREMENT,
    `user_id` int DEFAULT NULL,
    `comment` text,
    `insertedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `ip` varchar(100) DEFAULT '',
    `link` varchar(255) DEFAULT NULL,
    `mail` varchar(255) DEFAULT NULL,
    `nick` varchar(255) DEFAULT NULL,
    `pid` int DEFAULT NULL,
    `rid` int DEFAULT NULL,
    `sticky` boolean DEFAULT NULL,
    `status` varchar(50) NOT NULL DEFAULT '',
    `like` int DEFAULT NULL,
    `ua` text,
    `url` varchar(255) DEFAULT NULL,
    `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
  ) CHARSET=utf8mb4;
  ```

- 创建 `wl_Counter` 表
  ![创建wl_Counter表](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261021210959101.png)

  ```sql
  CREATE TABLE `wl_Counter` (
    `id` int unsigned NOT NULL AUTO_INCREMENT,
    `time` int DEFAULT NULL,
    `reaction0` int DEFAULT NULL,
    `reaction1` int DEFAULT NULL,
    `reaction2` int DEFAULT NULL,
    `reaction3` int DEFAULT NULL,
    `reaction4` int DEFAULT NULL,
    `reaction5` int DEFAULT NULL,
    `reaction6` int DEFAULT NULL,
    `reaction7` int DEFAULT NULL,
    `reaction8` int DEFAULT NULL,
    `url` varchar(255) NOT NULL DEFAULT '',
    `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
  ) CHARSET=utf8mb4;
  ```

- 创建 `wl_Users` 表
  ![创建wl_Users表](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261021211028586.png)

  ```sql
  CREATE TABLE `wl_Users` (
    `id` int unsigned NOT NULL AUTO_INCREMENT,
    `display_name` varchar(255) NOT NULL DEFAULT '',
    `email` varchar(255) NOT NULL DEFAULT '',
    `password` varchar(255) NOT NULL DEFAULT '',
    `type` varchar(50) NOT NULL DEFAULT '',
    `label` varchar(255) DEFAULT NULL,
    `url` varchar(255) DEFAULT NULL,
    `avatar` varchar(255) DEFAULT NULL,
    `github` varchar(255) DEFAULT NULL,
    `twitter` varchar(255) DEFAULT NULL,
    `facebook` varchar(255) DEFAULT NULL,
    `google` varchar(255) DEFAULT NULL,
    `weibo` varchar(255) DEFAULT NULL,
    `qq` varchar(255) DEFAULT NULL,
    `oidc` varchar(255) DEFAULT NULL,
    `2fa` varchar(32) DEFAULT NULL,
    `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
  ) CHARSET=utf8mb4;
  ```

### 准备 TiDB 连接配置

- 左侧边栏点击「Overview」→「Connect」
  ![Connect](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261021211203681.png)
- 数据库（Database）选择 `waline` ,操作系统（Operating System）选择 `macOS`
  ![Database和OperatingSystem](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261021211234682.png)
- Connect with 选择 `General`，点击 `Generate password` 生成密码
  ![GeneratePassword](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261021211255322.png)
- 保存以下连接参数（Parameters）

  ```text
  HOST: ****************.aws.tidbcloud.com
  PORT: 4000
  USERNAME: 123.root
  PASSWORD: 1234567890uC37vC
  DATABASE: waline
  CA: /etc/ssl/cert.pem
  ```

## 修改 Vercel 环境变量

- 进入 [Vercel](https://vercel.com/)
- 左侧边栏点击「Projects」，选择你的 Waline 项目
  ![Waline项目](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261021211452293.png)

### 新增 TiDB 环境变量

- 左侧边栏点击「Environment Variables」→「Add Environment Variable」
  ![Add Environment Variable](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261021211556844.png)
- 添加环境变量 `TIDB_HOST`、`TIDB_PORT`、`TIDB_USER`、`TIDB_PASSWORD`、`TIDB_DB`
  ![添加环境变量](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261021211622142.png)

| 环境变量名称（Key） |       备注       |
| :-----------------: | :--------------: |
|      TIDB_HOST      |   TiDB 的 HOST   |
|      TIDB_PORT      |   TiDB 的 PORT   |
|      TIDB_USER      | TiDB 的 USERNAME |
|    TIDB_PASSWORD    | TiDB 的 PASSWORD |
|       TIDB_DB       | TiDB 的 DATABASE |

{% note warning flat %}
经典踩坑提示：若将 `TIDB_USER` 误写为 `IDB_USER`，Waline 不会直接报错，但 Function Logs 中会出现 `No valid storage found` 提示，页面评论区表现为"看似已连接，实则未真正连通"。
{% endnote %}

### 删除 LeanCloud 变量

- 删除环境变量 `LEAN_ID`、`LEAN_KEY`、`LEAN_MASTER_KEY`

| 环境变量名称（Key） |          备注          |
| :-----------------: | :--------------------: |
|       LEAN_ID       |   LeanCloud 的 AppID   |
|      LEAN_KEY       |  LeanCloud 的 AppKey   |
|   LEAN_MASTER_KEY   | LeanCloud 的 MasterKey |

### 重新部署 waline 项目

- 左侧边栏点击「Deployments」，选择最新部署记录，点击「Redeploy」
  ![Deployments](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261021215356549.png)
- 点击「Redeploy」
  ![Redeploy](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261021215415445.png)

## 使用 waline-data-import-tool 导入数据

{% note info flat %}
这一步是整个迁移流程的关键所在。  
Waline 导出的 `waline.json` 中，评论的 `pid / rid` 字段仍存储为 LeanCloud 的 ObjectID，而 TiDB 中 `wl_Comment.id` 为自增整数。  
若直接将 JSON 数据导入数据库，父子评论关系将断裂，评论楼层也会显示混乱。  
`waline-data-import-tool` 会自动完成 ObjectID 到自增 ID 的映射转换，无需手动编写 SQL
{% endnote %}

### 创建项目文件夹

- 在本地创建文件夹 `waline-migrate`，后续所有文件都放在这里。

### 下载 waline-data-import-tool

- 项目地址：<https://github.com/elkan1788/waline-data-import-tool>
- 下载链接：<https://github.com/elkan1788/waline-data-import-tool/releases>
- 本文以 Windows 系统为例，下载 `waline-data-import-tool.exe.zip` 并解压至 `waline-migrate` 目录：
  ![waline-data-import-tool.exe](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261021215736507.png)

其他系统对应版本：

| 系统                | 文件名                                 |
| ------------------- | -------------------------------------- |
| macOS Apple Silicon | `waline-data-import-tool-darwin-arm64` |
| macOS Intel         | `waline-data-import-tool-darwin-amd64` |
| Linux x86_64        | `waline-data-import-tool-linux`        |
| Linux arm64         | `waline-data-import-tool-arm64`        |
| Windows             | `waline-data-import-tool.exe`          |

### 下载 CA 根证书

- TiDB Cloud Serverless 公开端点强制 TLS，需要 CA 证书。

- 在浏览器中访问 <https://letsencrypt.org/certs/isrgrootx1.pem>，将页面内容保存为 `isrgrootx1.pem` 文件，放置于 `waline-migrate` 目录下。

### 创建 waline-tidb.ini 文件

- 在 `waline-migrate` 目录下新建 `waline-tidb.ini` 文件，写入以下内容（请替换为你的 TiDB 实际连接信息）：

  ```ini
  [tidb]
  host=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
  port=4000
  user=123.root
  password=1234567890uC37vC
  database=waline
  ca=./isrgrootx1.pem
  ```

{% note pink 'fas fa-bullhorn' flat %}
如果 TiDB Cloud 控制台显示的 `user` 带有 `.root` 后缀，必须完整填写。
{% endnote %}

### 准备 waline.json 数据文件

- 将[从 Waline 管理后台导出旧数据](#从-Waline-管理后台导出旧数据)步骤中下载的 `waline.json` 复制到 `waline-migrate` 目录下。

### 确认目录结构

- 导入前确认 `waline-migrate` 目录中包含以下文件：

  ```text
  waline-migrate/
  ├── waline.json                    # 从 Waline 后台导出的数据
  ├── waline-data-import-tool.exe    # 导入工具
  ├── waline-tidb.ini                # TiDB 连接配置
  └── isrgrootx1.pem                 # CA 根证书
  ```

### 运行导入命令

- 在 `waline-migrate` 目录下打开终端，输入：
  ![导入命令](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261021215757792.png)

  ```powershell
  ./waline-data-import-tool -f ./waline.json -c ./waline-tidb.ini
  ```

- 程序运行时会提示将清空目标表，输入 y 并回车确认：
  ![输入y并回车确认](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261021215931096.png)
- 当终端输出 Users 导入完成、Comments 导入完成、Counter 导入完成 提示时，即表示数据导入成功。
  ![数据导入成功](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261021215942844.png)

## 校验迁移数据

- 打开 Waline 管理后台：<https://你的waline域名/ui/login?redirect=/ui>,用原管理员账号登录。
  ![waline管理后台登录](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261021204907985.png)
- 查看评论数据结构是否正常（包括父子回复关系、楼层顺序、昵称及头像是否完整）
  ![查看评论数据](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261021220400463.png)
- 查看用户数据是否正确迁移（管理员账号是否存在、OAuth 绑定关系是否保留）
  ![查看用户数据](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261021220413285.png)

## 总结

将 Waline 从 LeanCloud 迁移至 TiDB Cloud，核心流程可归纳为以下四步：

1. **先导出**：`waline.json` 是唯一真相源；
2. **再建表**：`wl_Comment / wl_Counter / wl_Users` 别漏 OAuth 字段；
3. **再导入**：用 `waline-data-import-tool` 处理 ObjectID → 自增 ID 的映射；
4. **最后切流量**：Vercel 加 `TIDB_*`，删 `LEAN_*`，Redeploy。

个人博客数据量通常较小，TiDB Serverless 的 5GB 免费额度基本够用。只要环境变量配置无误、注意时区设置，整个迁移过程通常可在 30 分钟至 2 小时内完成。

{% note green 'fa-solid fa-wand-magic-sparkles' flat %}
总结一句话：LeanCloud 退场不必恐慌，Waline 原生支持 TiDB，迁移成本主要集中在仔细配置环境变量，避免手误。
{% endnote %}
