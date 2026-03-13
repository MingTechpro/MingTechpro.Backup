---
title: 外网访问新方案：IPv6 + DDNS-GO + Cloudflare 配置全记录
abbrlink: dc023582
date: 2026-02-15 21:45:26
tags:
  - CasaOS
  - IPV6
categories: 网络
cover: https://jsd.012700.xyz/gh/MingTechPro/drawing-bed/post-img_url/20260307000153595.jpg
description:
---

## 引言

随着 IPv6 技术的全面普及，家庭宽带已逐步告别 IPv4 地址短缺、内网穿透依赖中转服务器的困境，多数运营商已为家庭用户分配以 240 开头的公网 IPv6 地址。与传统 IPv4 内网穿透方案相比，依托 IPv6 直接访问内网设备，具有`延迟低、传输速度快、无需额外中转节点、部署成本低`等核心优势，完美适配个人 NAS、软路由、Linux 设备服务。
然而，运营商分配的 IPv6 地址并非固定不变，会随网络重启、运营商配置调整等因素动态变化，导致无法通过固定 IP 实现外网稳定访问。基于此，本教程将详细讲解如何通过 DDNS-GO 动态解析工具，结合 Cloudflare 域名托管服务，实现外网通过域名快速、安全访问本地部署的 CasaOS，覆盖从环境准备、配置部署到安全加固的全流程，适用于 x86 软路由、树莓派、各类 Linux 设备等所有可安装 DDNS-GO 的场景，新手也能轻松上手。

## 准备工作(必做)

### 环境要求

| 项目     | 要求                                         |
| -------- | -------------------------------------------- |
| 宽带支持 | 已开启 IPv6（光猫/路由器）                   |
| 服务器   | 任意 Linux 设备                              |
| 域名     | 一个已托管在 Cloudflare 的域名               |
| 网络     | 目标设备能获得公网 IPv6 地址（光猫桥接模式） |

{% note orange no-icon %}
如果光猫未改桥接模式，会导致 IPV6 地址嵌套过多，无法正常的访问。
需要光猫改桥接模式可参考：[家庭网络架构升级指南：光猫桥接模式配置全流程](/posts/2455d826)
{% endnote %}

### 检查 IPv6 连通性

在 CasaOS 终端中执行以下命令检查 IPv6：

```bash
# 检查本机 IPv6 地址
ip -6 addr show | grep "scope global"

# 测试 IPv6 外网连通性
ping6 -c 4 2400:3200::1
```

{% note orange no-icon %}
如果能看到以 `240e`（中国电信）、`2408`（中国联通）、`2409`（中国移动）开头的 IPv6 地址，说明你的网络已支持 IPv6。
{% endnote %}

## Cloudflare 配置

### 获取 API Token

- 登录 [Cloudflare 控制台](https://dash.cloudflare.com/)，按以下步骤操作：

- 点击`右上角头像` → `配置文件`
  ![进入Cloudflare配置页面](https://jsd.012700.xyz/gh/MingTechPro/drawing-bed/post-img_url/20260227223857422.png)
- 左侧菜单选择 `API 令牌`
- 点击 `创建令牌`
  ![创建令牌](https://jsd.012700.xyz/gh/MingTechPro/drawing-bed/post-img_url/20260227230110711.png)
- 选择 `编辑区域 DNS` → `使用模板`
  ![编辑区域DNS模板](https://jsd.012700.xyz/gh/MingTechPro/drawing-bed/post-img_url/20260227230923509.png)
- 配置管理权限
- `区域管理` → `选择你的域名` → `继续以显示摘要`
  ![配置管理权限](https://jsd.012700.xyz/gh/MingTechPro/drawing-bed/post-img_url/20260227233751011.png)
- 创建令牌
  ![创建 API 令牌](https://jsd.012700.xyz/gh/MingTechPro/drawing-bed/post-img_url/20260227234106771.png)
  {% note orange no-icon %}
  务必保存好生成的 `Token`（只显示一次）
  {% endnote %}

## 安装 DDNS-GO

安装 `DDNS-GO` 有两种方式：`Docker` 容器部署 和 直接在 `CasaOS`。
我选择直接在 `CasaOS` 应用商店下载，自己使用 `Docker` 实在麻烦。
**项目地址：**[`jeessy2/ddns-go`](https://github.com/jeessy2/ddns-go)

### Docker 部署

- 挂载主机目录, 使用docker host模式。可把 `/opt/ddns-go` 替换为你主机任意目录, 配置文件为隐藏文件

  ```bash
  docker run -d --name ddns-go --restart=always --net=host -v /opt/ddns-go:/root jeessy/ddns-go
  ```

- [可选] 使用 `ghcr.io` 镜像

  ```bash
  docker run -d --name ddns-go --restart=always --net=host -v /opt/ddns-go:/root ghcr.io/jeessy2/ddns-go
  ```

- [可选] 支持启动带参数 `-l`监听地址 `-f`间隔时间(秒)

  ```bash
  docker run -d --name ddns-go --restart=always --net=host -v /opt/ddns-go:/root jeessy/ddns-go -l :9877 -f 600
  ```

- [可选] 不使用docker host模式

  ```bash
  docker run -d --name ddns-go --restart=always -p 9876:9876 -v /opt/ddns-go:/root jeessy/ddns-go
  ```

- [可选] 重置密码

  ```bash
  docker exec ddns-go ./ddns-go -resetPassword 123456
  docker restart ddns-go
  ```

## 配置 DDNS-GO

- 打开浏览器访问：

  ```PLAINTEXT
    http://主机IP:9876
  ```

- 输入 `账号` → `密码` → `登录并配置为管理员帐号`  
  ![登录并配置为管理员帐号](https://jsd.012700.xyz/gh/MingTechPro/drawing-bed/post-img_url/20260228002001390.png)

- 配置 DNS服务商 `Cloudflare` → `Token`
  ![配置DNS服务商](https://jsd.012700.xyz/gh/MingTechPro/drawing-bed/post-img_url/20260228002843033.png)

- 配置 IPV6 设置 `是否启用` → `通过网卡获取` → `Domains域名`
- proxied=true `开启代理` Cloudflare 部分端口是不开放的需要做源地址端口转发
- 示例：

  ```PLAINTEXT
    casaos.Domains域名.com?proxied=true
  ```

  ![开启IPV6设置](https://jsd.012700.xyz/gh/MingTechPro/drawing-bed/post-img_url/20260228003705236.png)

- 保存配置
  ![保存配置](https://jsd.012700.xyz/gh/MingTechPro/drawing-bed/post-img_url/20260228004700619.png)

## 路由器防火墙放行

- 进入路由器防火墙管理界面，将入站数据、出站数据、转发都修改为接受。
- 使用 IPV6 不需要做端口映射，如果是使用 IPV4 需要设置端口转发。
  ![防火墙管理](https://jsd.012700.xyz/gh/MingTechPro/drawing-bed/post-img_url/20260228140940487.png)
- 查看 Cloudflare NDS 设置
  ![CloudflareNDS设置](https://jsd.012700.xyz/gh/MingTechPro/drawing-bed/post-img_url/20260228142602053.png)
  操作到这里外网域名已经可以正常访问了。

## 安全配置（可选配置）

### DDNS-GO 安全配置

#### 开启禁止公网访问

**功能说明：**限制 DDNS-GO 仅允许内网访问，禁止公网直接登录管理后台，避免因密码泄露、弱口令等导致面板被恶意登录、域名解析被篡改，大幅提升内网服务的访问安全。
![禁止公网访问](https://jsd.012700.xyz/gh/MingTechPro/drawing-bed/post-img_url/20260228142014126.png)

### Cloudflare 安全设置

#### 开启 SSL/TLS 加密

**功能说明：**为域名开启 HTTPS 加密，使浏览器与服务器之间的传输数据加密，防止数据被窃听、篡改或劫持，是网站安全的基础配置。

- 左侧菜单选择 `SSL/TLS` → `概述` → `配置`
  ![SSL/TLS配置](https://jsd.012700.xyz/gh/MingTechPro/drawing-bed/post-img_url/20260228143903983.png)

- 进入配置选择 `自定义SSL/TLS` → `灵活` → `保存`
  ![自定义SSL/TLS](https://jsd.012700.xyz/gh/MingTechPro/drawing-bed/post-img_url/20260228144736797.png)

#### 开启始终使用 HTTPS

**功能说明：**强制所有访问请求自动从 HTTP 跳转至 HTTPS，避免用户因输入普通 HTTP 地址导致数据传输未加密，进一步强化域名访问安全性。

- 左侧菜单选择 `边缘证书` → `始终使用 HTTPS 开启`
  ![始终使用 HTTPS](https://jsd.012700.xyz/gh/MingTechPro/drawing-bed/post-img_url/20260228145437230.png)

#### 开启 TLS 1.3

**功能说明：**启用最新的 TLS 1.3 加密协议，相比旧版本大幅提升数据加密传输速度，同时增强加密安全性，抵御各类潜在的协议层攻击。

- 左侧菜单选择 `边缘证书` → `TLS 1.3 、开启`
  ![TLS 1.3](https://jsd.012700.xyz/gh/MingTechPro/drawing-bed/post-img_url/20260228150213501.png)

#### 开启自动 HTTPS 重写

**功能说明：**自动检测并修复网页中未加密的 HTTP 资源引用，避免因混合内容（HTTP+HTTPS）导致浏览器提示 “不安全”，保证页面加载安全且正常显示。

- 左侧菜单选择 `边缘证书` → `自动 HTTPS 重写开启`
  ![自动 HTTPS 重写](https://jsd.012700.xyz/gh/MingTechPro/drawing-bed/post-img_url/20260228150539077.png)

## 总结

本教程完整实现了`“IPv6 + DDNS-GO + Cloudflare”`的外网访问 CasaOS 方案，核心逻辑是利用公网 IPv6 的直连优势，通过 `DDNS-GO` 动态跟踪 IPv6 地址变化，再借助 `Cloudflare` 域名解析实现稳定访问，全程无需依赖第三方中转服务器，兼顾速度与便捷性。

**整个部署流程可分为四大核心步骤：**

1. 首先完成环境准备，确认宽带支持 IPv6 并获取公网 IPv6 地址（光猫桥接是关键前提）；
2. 其次在 Cloudflare 控制台获取 API Token，为域名解析授权；
3. 然后安装并配置 DDNS-GO，实现 IPv6 地址与域名的动态绑定；
4. 最后通过路由器防火墙放行，搭配可选的安全配置，保障访问安全。

**需要重点注意：**

- 光猫未桥接会导致 IPv6 地址嵌套异常，无法正常访问；
- Cloudflare API Token 仅显示一次，务必妥善保存；
- IPv6 无需端口映射，与 IPv4 内网穿透方案存在本质区别；
- 安全配置虽为可选，但开启后能大幅降低被恶意攻击的风险，建议优先配置。

本方案适用于各类本地部署 CasaOS 的场景，无论是个人 NAS 存储、私人服务程序还是软路由管理，都能通过该方法实现外网稳定访问，操作流程简洁，新手可按步骤逐步执行，遇到问题可优先检查 IPv6 连通性和 Cloudflare 配置是否正确。
