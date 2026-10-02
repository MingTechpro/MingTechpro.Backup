---
title: fnOS 部署青龙面板：基于 Docker Compose 的定时任务持久化方案
date: 2026-08-18 22:37:06
categories: 网络 & 自部署
tags: [fnOS, Docker, 青龙面板, Docker Compose]
cover: https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/wallpaper/20260313152457641.jpg
description: 详细讲解如何在飞牛 fnOS 中使用 Docker Compose 部署青龙面板，通过 Volume 映射实现配置与脚本的持久化，确保定时任务稳定运行。
abbrlink: e938c45c
---

## 前言

如果你有一台跑 fnOS（飞牛）的 NAS 或小主机，想把各类签到、定时采集、自动化脚本集中管理，青龙面板是非常合适的选择。它基于 Docker，提供 Web 管理后台、cron 定时任务、环境变量、脚本/订阅管理以及通知渠道，默认 Web 端口 5700。

在 fnOS 部署青龙有两种思路

- Docker-compose：更通用、更可控的是用 fnOS 自带 Docker 做 Compose 部署，数据挂到宿主机目录，重装/升级容器都不丢配置。可按照本文章顺序跑通。

- 应用中心一键安装：应用中心如果能搜到“青龙”可点击安装更方便。

## 准备工作

### 确认 Docker 可用

- 登录 fnOS Web 管理台，点击 `Docker` 应用进入。
  ![Docker应用](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002021231605.png)

- 首次打开 Docker 会让你设置存储位置，建议放到 SSD 或固定存储空间，后续镜像、容器数据都从这里走。
  ![配置存储位置](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002021306572.png)
  ![选择存储位置](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002021327927.png)

- 设置完成后，在 Docker 应用里能看到`概览、容器、Compose、镜像、网络` 等入口即可。
  ![Docker应用](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002021344447.png)

### 创建青龙数据目录

青龙所有配置、脚本、日志、数据库都建议挂到宿主机。通常将 `/ql/data` 挂载到宿主机 `/vol1/1000/Docker/qinglong`，路径覆盖配置、脚本、仓库、日志、数据库等核心数据。

- 点击 `文件管理` 应用
  ![文件管理应用](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002021402120.png)

- 创建路径：`/Docker/qinglong`
  ![创建文件路径](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002021557451.png)

## Compose 部署青龙

### Docker 界面创建 Compose 项目

- 返回 `Docker` 应用，「Compose」→「新增项目」
  ![新增项目](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002021613962.png)

- 填写项目名称：qinglong
  ![填写项目名称](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002021626841.png)

- 选择项目路径：存储空间 1/我的文件/Docker/qinglong
  ![选择项目路径](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002021637533.png)
  ![选中文件夹](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002021657681.png)

- 选择创建「创建 docker-compose.yml」写入内容如下：
  ![docker-compose.yml](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002021727879.png)

```yaml
services:
  qinglong:
    image: whyour/qinglong:latest
    container_name: qinglong
    restart: unless-stopped
    ports:
      - "5700:5700"
    environment:
      TZ: Asia/Shanghai
      QlBaseUrl: "/"
      QlPort: "5700"
    volumes:
      - /vol1/1000/Docker/qinglong:/ql/data
```

- 勾选「创建项目后立即启动」
  ![创建项目后立即启动](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002021815660.png)

- 等待构建完成
  ![等待构建完成](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002021828544.png)

### 应用中心一键安装（备选）

部分 fnOS 应用中心版本可能直接提供 “青龙面板” 模板。路径：应用中心搜索 “青龙” → 安装 → 按向导设置端口与存储目录 → 完成后在 “已安装” 里打开。优点是少配 YAML，缺点是版本更新可能慢于官方 Docker 镜像。若应用中心搜不到，不要纠结，直接用 Docker Compose 方案。

## 初始化青龙面板

首次进入会走初始化向导，跟着教程配置即可。

- 点击「容器」→「快捷访问」
  ![快捷访问青龙面板](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002021849447.png)
  ![青龙面板初始化](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002021908207.png)

- 设置通知方式：我是配置企业微信机器人
  ![设置通知方式](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002021923503.png)

- 设置管理员账号、密码
  ![设置管理员账号、密码](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002021933935.png)
  ![青龙面板配置完成](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002021946583.png)

- 登录青龙面板
  ![登录青龙面板](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002021955412.png)

## 基础配置

### 配置环境变量

青龙面板里 “环境变量” 用于放脚本需要的 Cookie、Token、账号和密码等。

- 左侧边栏「环境变量」→「创建变量」
  ![创建变量](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002022014374.png)

- 按脚本要求填写名称/值

  例如：JD_COOKIE、PUSH_PLUS_TOKEN 等，名称必须与脚本读取的变量名一致。
  ![输入名称/值](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002022148397.png)

- 保存后，定时任务才能读到这些变量
  ![环境变量](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002022342547.png)
  > 注意：敏感变量不要在公网裸暴露。

### 安装脚本依赖

很多签到脚本依赖于 Nodejs/Python 的包进行编写，使用时需要提前添加相应的依赖。

- 左侧边栏「依赖管理」→「创建依赖」

  以 Python3 脚本中经常使用到的 requests 包为例创建依赖。
  ![创建依赖](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002022401772.png)

- 依赖类型选择「Python3」
  ![依赖类型选择](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002022506059.png)
- 名称填入「requests」
  ![名称填入](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002022514744.png)
- 依赖装完再跑脚本，能大幅减少运行时报错。
  ![依赖管理](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002022526863.png)

## 脚本与定时任务

### 手动添加脚本

- 左侧边栏「脚本管理」→「创建」
  ![创建脚本](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002022544121.png)
- 创建 example.sh 文件
  ![example.sh](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002022551495.png)
- 写入示例代码，并保存
  ![示例代码](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002022754116.png)

示例：

```bash
#!/bin/bash
echo "青龙测试任务 $(date '+%F %T')"
```

- 保存后，点击「调试」进入调试界面
  ![调试脚本](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002022902390.png)
- 点击「运行」查看日志确认无报错，再做成定时任务。
  ![运行脚本](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002022919959.png)

### 创建定时任务

- 左侧边栏「定时任务」→「创建任务」
  ![创建定时任务](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002023404835.png)

- 名称：填入 `定时任务`
  ![名称](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002023420439.png)

- 命令/脚本：填入 `example.sh 或 task example.sh`
  ![命令/脚本](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002023433638.png)

- 定时类型：默认 `常规定时`
  ![定时类型](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002023450865.png)

- 定时规则：填入 `0 0 * * *`
  ![定时规则](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002023508444.png)

- 确定创建定时任务
  ![确定创建定时任务](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002023525171.png)

- 点击「运行」测试定时任务
  ![测试定时任务](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002023535464.png)

- 点击「日志」查看定时任务是否成功执行
  ![查看定时任务日志](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002023545957.png)
  ![定时任务日志](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002023612729.png)

## 订阅批量拉库

“拉库”是青龙面板中特有的术语，指从远程 Git 仓库中批量拉取脚本文件到本地青龙面板的过程。以拉取 Faker3 库为例，演示完整的配置过程。

### 创建订阅项目

- 左侧边栏「订阅管理」→「创建订阅」
  ![创建订阅](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002023649423.png)

- 名称：填写 `Faker3京东库`
  ![名称](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002023658275.png)

- 类型：选择 `公开仓库`
  ![类型](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002023734697.png)

- 链接：填写 `https://github.com/shufflewzc/faker3.git`
  ![链接](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002023748024.png)

- 分支：填写 `main`
  ![分支](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002023748024.png)

- 定时类型：选择 `crontab`
  ![定时类型](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002023810478.png)

- 定时规则：填写 `0 0 * * *`
  ![定时规则](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002023810478.png)

- 白名单：填写 `jd_|jx_|gua_|jddj_|jdCookie`
  ![白名单](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002023849076.png)

- 黑名单：填写 `activity|backUp`
  ![黑名单](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002023902855.png)

- 依赖：填写 `^jd[^_]|USER|function|utils|sendNotify|ZooFaker_Necklace.js|JDJRValidator_|sign_graphics_validate|ql|JDSignValidator|magic|depend|h5sts`
  ![依赖](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002023916418.png)

- 文件后缀：填写 `js`
  ![文件后缀](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002023924601.png)

- 确定创建订阅
  ![确定创建订阅](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002023959004.png)

### 执行订阅批量拉库

订阅创建后，需要手动执行一次拉库操作，验证创建订阅配置是否正确。

- 点击「运行」测试订阅配置是否正确
  ![测试订阅配置](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002024017643.png)

- 点击「日志」查看订阅是否成功执行
  ![查看订阅日志](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002024029163.png)
  ![订阅日志](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002024037944.png)
  > 不建议盲目添加来源不明的大库，避免执行到泄露账号、异常请求的脚本。

### 查看定时任务

拉库成功后，会自动生成相应的定时任务。

- 左侧边栏「定时任务」查看是否自动添加定时任务
  ![查看定时任务](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002024059269.png)

## 备份与更新

### 备份数据

如遇到青龙面板版本更新，建议先备份 `/Docker/qinglong`

- 打开 `文件管理` 应用，创建路径：`/重要文件备份`
  ![重要文件备份](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002024248170.png)

- 全选 `/Docker/qinglong` 文件夹
  ![/Docker/qinglong](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002024307391.png)

- 操作鼠标右键单击，「复制到/移动到」→「复制到」
  ![复制到/移动到](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002024319899.png)

- 选中 `重要文件备份` 「复制到此」
  ![复制到此](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002024331491.png)

- 选择 「复制并覆盖」
  ![复制并覆盖](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002024633280.png)

### 更新镜像

- 打开 `Docker` 应用，「Compose」→「停止」
  ![停止容器](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002024807120.png)

  ![停止容器日志](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002024818664.png)

- 点击「构建」
  ![构建容器](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002024830744.png)

- 等待构建完成
  ![构建容器日志](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20261002024838691.png)

青龙面板核心数据挂载在 `/Docker/qinglong` 更新一般不会清配置。但大版本升级前仍建议先备份。

## 总结

在飞牛 fnOS 上部署青龙面板，核心就三件事：数据挂出来、Compose 部署、进面板配任务。

- 数据持久化是底线：把宿主机目录（如 /vol1/1000/Docker/qinglong）挂载到容器 /ql/data，重装系统、删容器、升级镜像都不丢脚本和配置。

- Compose 是最稳的部署方式：5700 端口映射 + Asia/Shanghai 时区 + unless-stopped 重启策略，一条 YAML 搞定，fnOS 的 Docker 界面直接可视化操作，门槛很低。

- 初始化后做三件事：设管理员账号 → 填环境变量（Cookie/Token）→ 装依赖（Python3/Node.js 包），顺序别反，否则脚本跑不起来。

- 任务两种来源：自己写脚本手动建 cron，或者订阅公开仓库批量拉库。拉库注意白名单过滤，别无脑加不明来源的库。

- 维护成本很低：日常备份 /ql/data 目录，更新镜像只需停容器 → 重新构建，配置原样保留。

跑通之后，你就拥有了一个 7×24 小时的自动化调度员——签到、采集、监控、定期清理都能托管进去。唯一要记住的铁律：只加自己信任的脚本，别把 5700 端口裸暴露在公网，Cookie 和 Token 只填自己的账号。
