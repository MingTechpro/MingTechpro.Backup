---
title: Valine 平滑升级至 Waline：基于 LeanCloud 的无痛迁移与部署指南
date: 2026-04-16 22:05:50
categories: 博客折腾
tags: [Waline, Valine, LeanCloud, 评论系统]
cover: https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/wallpaper/20260314170101105.jpg
description: Valine 作者已长期未维护，且存在潜在的 XSS 安全漏洞和隐私泄露风险（如邮箱泄露）。Waline 作为 Valine 的继任者，由社区活跃维护，不仅修复了安全问题，还新增了邮件通知、图片上传、点赞等功能，且完全兼容旧版 LeanCloud 数据。
abbrlink: 15b0e8c8
---

## 前言

📢 为什么要从 Valine 迁移到 Waline？
Valine 作者已长期未维护，且存在潜在的 XSS 安全漏洞和隐私泄露风险（如邮箱泄露）。Waline 作为 Valine 的继任者，由社区活跃维护，不仅修复了安全问题，还新增了邮件通知、图片上传、点赞等功能，且完全兼容旧版 LeanCloud 数据。

## 配置 LeanCloud 应用

{% note info flat %}
由于 LeanCloud 在2026年1月12日就通知了停服，将不能再注册和创建应用服务。本教程只适合之前已经创建过应用服务的国际版用户。
{% endnote %}

### 获取应用凭证 AppID、AppKey 和 MasterKey

- 点击之前创建的应用服务
  ![应用服务](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260622230329807.png)

- 点击「设置」→「应用配置」可以看到 `AppID` 、 `AppKey` 和 `MasterKey`
  ![AppID、AppKey和MasterKey](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260622230529097.png)

## Vercel 部署 Waline

- 点击下方按钮，跳转至 Vercel 进行 Server 端部署。
  [![Deploy with Vercel](https://cdn.jsdmirror.cn/gh/MingTechpro/drawing-bed/avatar-bg_url/20260623223629724.svg)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fwalinejs%2Fwaline%2Ftree%2Fmain%2Fexample&teamSlug=mingtechpros-projects)

  > 如果你未登录的话，Vercel 会让你注册或登录，请使用 GitHub 账户进行快捷登录。

- 点击 「Continue with GitHub」登录
  ![注册或登录](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260622232133699.png)

- 输入一个你喜欢的 Vercel 项目名称并点击 `Create` 继续
  ![创建项目名称](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed@main/post-img_url/20260622233021493.png)

- 此时 Vercel 会基于 Waline 模板帮助你新建并初始化仓库，仓库名为你之前输入的项目名。
  ![初始化项目](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260622234250792.png)

- 一两分钟后，满屏的烟花会庆祝你部署成功。此时点击 `Go to Dashboard` 可以跳转到应用控制台。
  ![部署完成](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260622234620194.png)
  ![应用控制台](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260623000040429.png)

## Waline 服务端设置

### 环境变量配置

- 点击「环境变量」→「Add Environment Variable」
  ![环境变量](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260623003225928.png)

- 输入「Key & Value」→「Save」保存
  ![配置环境变量](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260623003245698.png)

### 环境变量说明

- 必填 Key

| 环境变量名称（Key） |          备注          |
| :-----------------: | :--------------------: |
|       LEAN_ID       |   LeanCloud 的 AppID   |
|      LEAN_KEY       |  LeanCloud 的 AppKey   |
|   LEAN_MASTER_KEY   | LeanCloud 的 MasterKey |

- 选填 Key

| 环境变量名称（Key） |            备注            |
| :-----------------: | :------------------------: |
|      SITE_NAME      |          网站名称          |
|      SITE_URL       |          网站地址          |
|     AKISMET_KEY     | Akismet 反垃圾评论服务 Key |
|    GRAVATAR_STR     |          默认头像          |
|      SMTP_USER      |   SMTP 邮件发送服务邮箱    |
|      SMTP_PASS      |  SMTP 邮件发送服务的密码   |
|    SMTP_SERVICE     |     邮件发送服务提供商     |
|    AUTHOR_EMAIL     | 博主邮箱（接收新评论通知） |
|    SENDER_EMAIL     |     自定义邮件发件地址     |
|     SENDER_NAME     |      自定义邮件发件人      |

更多环境变量参考 [Waline服务端环境变量](https://waline.js.org/reference/server/env.html)

## 总结

至此，你已经成功完成了从 Valine 到 Waline 的平滑迁移。这次升级不仅仅是一次简单的版本更替，更是一次安全架构的重构。

回顾整个过程，得益于 Waline 对 LeanCloud 数据结构的完美继承，你的历史评论数据实现了零丢失、零转换。最关键的改变在于：原本直接暴露在前端代码中的 AppKey 和 MasterKey 现在被安全地封装在服务端（Vercel）的环境变量中。这意味着即使有人查看你的网页源码，也无法获得操作数据库的权限，从根本上堵住了数据被恶意篡改的风险。

现在，你可以放心地享受 Waline 带来的新特性（如图片上传、表情包、点赞功能）了。如果在配置邮件或自定义域名时遇到问题，欢迎在评论区留言交流！
