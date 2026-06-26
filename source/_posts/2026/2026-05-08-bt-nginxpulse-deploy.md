---
title: 宝塔面板部署NginxPulse：轻量级Nginx日志分析与可视化实战
date: 2026-05-08 22:22:13
categories: 运维笔记
tags: [Nginx, NginxPulse, 宝塔面板, 日志分析, 监控面板]
cover: https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/wallpaper/20260314170845753.png
description: 详细讲解如何在宝塔面板中部署 NginxPulse，利用其现代化 UI 实现对 Nginx 访问日志的实时监控、访客统计与流量分析。
abbrlink: 335f12df
---

## 前言

如果你用过宝塔面板跑网站，一定对 /www/wwwlogs/ 下的那些 access.log 不陌生——几 MB、几十 MB、甚至 GB 级的纯文本行，里面藏着你网站每一秒的真实流量，但你平时只会偶尔 tail -f 看一眼有没有被扫，更多时候它们只是安静地躺在磁盘里轮转、压缩、过期删除。

NginxPulse 就是为解决这个问题而生的：一个轻量级 Nginx 访问日志分析与可视化面板，基于 Go + Vue3 构建，Docker 一键启动，零外部依赖，能把你的原始日志变成：

• 📈 实时 PV / UV 趋势图（按分钟 / 小时 / 天聚合）

• 🌍 IP 归属地热力图，快速锁定异常来源

• 🔍 状态码分布（2xx / 3xx / 4xx / 5xx）、爬虫识别、客户端解析

• 📊 Referer 来源分析、高频访问路径排行

• 多站点统一管理，还支持 .gz 压缩历史日志直读

## 准备工作：搞清楚宝塔的 Nginx 日志在哪

- 宝塔的网站访问日志默认不在 `/var/log/nginx/`，而是在：`/www/wwwlogs/` 所有站点的日志根目录

- 快速确认：

  打开宝塔面板 → 「网站」 → 任一站点「设置」
  ![设置](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260616224821275.png)

- 「配置文件」→ 「Ctrl+F」搜索关键字：`access_log`，就能看到宝塔实际写入的路径，通常是：

  ```JSON
  access_log  /www/wwwlogs/example.com.log;
  ```

  ![配置文件](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260616225150194.png)

## 安装 Docker（宝塔一键搞定）

- 登录宝塔面板 → 左侧导航 → 「Docker」 → 「立即安装」 → 「确认」
  ![Docker安装](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260616232343198.png)
  ![确认安装](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260616232551885.png)

- 等待安装完成
  ![等待安装完成](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260616233733561.png)

## 部署 NginxPulse（核心步骤）

### NginxPulse Docker 镜像搜索

- 左侧导航 → 「Docker」 → 「应用商店」 → 输入「nginxpulse」 → 「搜索」 → 「安装」
  ![NginxPulse Docker镜像搜索](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260616234250805.png)

### NginxPulse 安装配置

- 修改日志目录 `/www/wwwlogs`。

  {% note pink 'fas fa-gear' flat %}
  注意：其余配置一定不要修改，不然将会出现不控的问题。
  {% endnote %}

  ![NginxPulse 安装配置](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260616235746516.png)

- 等待安装完成
  ![等待安装完成](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260617001400305.png)

- 安装完成后先停止容器
  ![停止容器](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260617004153755.png)

## NginxPulse Docker 镜像最后的设置

### 文件夹权限配置（必须配置）

- 左侧导航 → 「文件」 → 「文件地址栏」 → 输入「`/www/dk_project/dk_app/nginxpulse`」 → 进入安装目录
  ![安装目录](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260617005433948.png)

- 严格的将 `configs`、`logs`、`nginxpulse_data` 文件夹的权限/所有者都设置为755/www。
- 严格的将 `pgdata` 文件夹的权限/所有者都设置为700/www。
  ![权限/所有者](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260617005717407.png)

### 放行防火墙端口

- 左侧导航 → 「安全」 → 「添加端口规则」
  ![添加端口规则](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260617010529564.png)

- 端口：`8088`，备注：`NginxPulse服务`
  ![设置端口](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260617010547912.png)

- 设置完成后就可以去启动容器了
  ![启动容器](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260617010750902.png)

  {% note blue 'fas fa-bullhorn' flat %}
  如果用的是云服务商（阿里云/腾讯云/AWS），还要去云平台安全组放行 8088 端口。
  {% endnote %}

## 首次访问 & 面板配置

- 浏览器输入 `IP:8088` 首次访问会进入配置页面

  ```TEXT
  http://你的IP:8088
  ```

- 配置站点名称、域名列表（其他保持默认）
  ![站点名称、域名列表](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260617220616361.png)
- 数据库连接（默认）
  ![数据库连接](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260617221421088.png)

- 运行参数（默认）
  ![运行参数](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260617221442541.png)

- 保存并重启
  ![保存并重启](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260617221458129.png)

## 页面展示

- 桌面端
- 页面入口：`http://IP:8088`
  ![桌面端](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260617222011802.png)

- 手机端
- 页面入口：`http://IP:8088/m`（功能精简为概览/日报/实时/日志四页，首次初始化仍需在电脑端完成）
  ![手机端](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260617222026802.png)

## 总结

宝塔管 Web 运行，NginxPulse 管流量洞察，Docker 管部署隔离 —— 三者配合，10 分钟内你就能从「盲跑」升级到「看得见、查得清、反应得快」。
