---
title: Cloudflare 15年免费SSL证书申请与部署：宝塔面板完整配置指南
date: 2026-04-28 23:09:04
categories: 运维笔记
tags: [Cloudflare, SSL, 宝塔面板, 网络安全]
cover: https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/wallpaper/20260617232235155.png
description: 详解如何申请 Cloudflare 15 年有效期的源站证书（Origin CA），并在宝塔面板中正确部署，彻底解决 SSL 证书过期烦恼。
abbrlink: 95636aff
---

## 前言

很多站长都遇到过这种情况：

- Let's Encrypt 90天到期，忘了续期，网站直接挂掉
- 付费证书一年几百块，小站点不划算
- 自签名证书浏览器疯狂报红，用户体验极差

如果你已经用了 Cloudflare CDN，那恭喜你——你其实可以绕过所有续期烦恼。
外部访问走的是Cloudflare的标准证书，完全不用担心；内部源站之间用这张超长有效期的证书加密，稳如老狗。

{% note green 'fa-solid fa-wand-magic-sparkles' flat %}
本文提到的“15年免费证书”是指 **Cloudflare Origin Certificates（源站证书）**。它仅用于加密 CDN 节点到你的服务器之间的流量，**不需要域名备案**，且不可直接在浏览器中作为独立证书使用（浏览器会不信任）。但对于开启了 Cloudflare 代理（小黄云）的站点来说，这是实现“一次部署，永久有效”的最佳方案。
{% endnote %}

## 准备工作

开始前你需要：

- 一个 Cloudflare 账号（免费版即可）
- 域名已接入 Cloudflare（DNS指向Cloudflare）
- 一台有公网IP的服务器（已安装宝塔面板）

## 生成15年证书

### 进入Cloudflare证书管理页面

- 登录 Cloudflare 仪表盘 → 点击你的域名 → 左侧菜单找到 [SSL/TLS] → 点击 [源服务器]。
  ![源服务器](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260615232102641.png)

### 创建证书

- 在源服务器菜单中点击 [Origin 证书]，点击下方的 [创建证书]。
  ![创建证书](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260615232810147.png)

- 证书配置推荐默认

  {% note blue 'fa-solid fa-bell' flat %}
  私钥类型保持默认的RSA(2048)、域名默认自动填上你的根域名和泛域名、证书有效期默认15年。
  {% endnote %}

- 点击 [创建]，系统会立刻生成一对密钥。
  ![证书配置](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260615233443596.png)

### 保存源证书和私钥

- 加密证书创建出来后别急着点确定。
- 私钥信息只在这个时候显示，没有保存的话，将无法再次查看。
- 建议复制、粘贴到本地记事本里保存好，一旦关掉这个页面，你就再也看不到私钥了，只能重新生成。
  ![源证书和私钥](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260615234300222.png)

## 将创建的SSL证书配置到宝塔上的网站

### 进入站点SSL设置

- 进入宝塔的面板页面，左侧菜单栏中点击 [网站]。找到你要配置SSL证书的网站。SSL证书这一栏显示的是“未部署”，点击打开配置页面。
  ![宝塔面板配置](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260615234950825.png)

### 配置SSL证书

- 选择当前证书
  ![当前证书](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260616000343939.png)

- 将私钥粘贴到密钥(KEY)
- 注意事项：需要完整的粘贴文本包括 `-----END CERTIFICATE-----`
  ![密钥(KEY)](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260616000405407.png)

- 将源证书粘贴到证书(PEM格式)
- 注意事项：需要完整的粘贴文本包括 `-----BEGIN CERTIFICATE-----`
  ![证书(PEM格式)](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260616000646904.png)

- 点击 [保存并启用证书] 。
  ![保存并启用证书](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260616000727605.png)

### 关于“验证失败”的说明

- 你可能会看到这样的提示：`证书链不完整,缺少颁发者证书且未被系统信任。`
  ![验证证书失败](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260616001125765.png)

别慌，这是正常的。

因为这张证书是 Cloudflare 自己发布的证书,只用于 Cloudflare 到你服务器之间的加密通信。浏览器端并不直接验证它。只要 Cloudflare 那边能识别就行。

这也是为什么要使用它必须使用 Cloudflare CDN 的原因。这个证书仅用于 Cloudflare 和你的服务器的通信，用户访问你的网站时 Cloudflare 会使用真正的SSL证书为你提供HTTPS。

## 最终调整：开启完全加密

- 为了让整个链路都走 HTTPS 协议，还需要进行已下配置。

### 设置加密模式和源连接

- 在 Cloudflare 左侧菜单找到 [SSL/TLS] → [概述] → [配置]
  ![SSL/TLS 概述](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260616002032114.png)

- 在 [加密模式和源连接设置] 菜单中选择 [完整(严格)]
  ![20260616002148996](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260616002148996.png)

- 保存配置
  ![保存配置](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260616002557963.png)

### 始终使用 HTTPS 协议

- 在 Cloudflare 左侧菜单找到 [SSL/TLS] → [边缘证书]，下滑页面 [始终使用 HTTPS] 开启
  ![始终使用 HTTPS](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260616003121861.png)

### 自动 HTTPS 重写

- 在 Cloudflare 左侧菜单找到 [SSL/TLS] → [边缘证书]，下滑页面 [自动 HTTPS 重写] 开启
  ![自动 HTTPS 重写](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260616003731405.png)

- 配置完成后：
  - 用户 → Cloudflare：标准HTTPS（浏览器信任）
  - Cloudflare → 源站：用刚配置的15年证书加密
  - 全链路加密，安全无死角。

## 几个常见疑问

Q1：15年后怎么办？

{% note orange 'fa-regular fa-comment' flat %}
到时候再生成一张新的就行了。不过说实话，15年后你的网站还在不在都不一定呢😂
{% endnote %}

Q2：这个证书能在浏览器里直接用吗？

{% note orange 'fa-regular fa-comment' flat %}
不能。 这是源站证书，不是公开受信的SSL证书。浏览器访问时看到的仍然是Cloudflare提供的标准证书。
{% endnote %}

Q3：如果我换了服务器怎么办？

{% note orange 'fa-regular fa-comment' flat %}
只要域名还在Cloudflare上，把私钥和证书文件传到新服务器重新配置一下就行，不需要重新生成。
{% endnote %}

Q4：免费版Cloudflare能用吗？

{% note orange 'fa-regular fa-comment' flat %}
完全可以，本文操作全程不需要花一分钱。
{% endnote %}

## 总结

|  对比项  | Let's Encrypt  | 付费商业证书 |  Cloudflare 源站证书   |
| :------: | :------------: | :----------: | :--------------------: |
|  有效期  |      90天      |    1~2年     |          15年          |
|   价格   |      免费      | 几百~几千/年 |          免费          |
|   续期   | 需要自动化脚本 |   手动续费   |       几乎不用管       |
| 适用场景 |    任何站点    |  企业级需求  | 已有 Cloudflare 的用户 |

- 如果你已经在用Cloudflare做CDN，强烈建议顺手配一张源站证书。15年不用操心续期问题，省心又省钱。

- 现在就打开Cloudflare去生成吧，别忘了立刻保存私钥！

---

觉得有用的话点个赞👍，转发给还在为SSL续期头疼的朋友吧～
