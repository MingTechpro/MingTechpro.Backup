---
title: 网心云OECT刷机指南：刷入 fnOS 打造低功耗私有云
date: 2026-09-24 20:50:17
categories: 硬件折腾
tags: [fnOS, 飞牛私有云, 网心云OECT, 家庭服务器]
cover: https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260924233323847.png
description: 将吃灰的网心云 OECT 通过刷机改造，刷入 fnOS（飞牛私有云 ARM 版），变废为宝打造低功耗家庭 NAS。
abbrlink: 7e43b1c0
---

## 前言

抽屉里那台 **网心云 OECT**（One Ecosystem Computing Tool）又翻出来了。RK3566 四核 A55、4GB 内存、8GB eMMC，还带 2.5 寸 SATA 盘位，待机功耗，放以前跑网心云收益聊胜于无，现在纯吃灰太浪费。

CasaOS 适合轻量面板，但想要正经 NAS 体验、SMB 共享、相册、影视、Docker、FN Connect 还是 fnOS（飞牛私有云）更对味。飞牛后来放出了适配 OEC/OECT 的 ARM 版镜像，这玩意儿终于能体面的当私有云用了。

本篇记录从拆机短接到进 fnOS 网页端的完整过程。

## 准备工作

在开始之前，请准备好以下工具：

- **硬件**：
  - 网心云 OECT 设备（确保能正常通电）
  - 一条 USB Type-C 数据线（用于线刷）
  - 电脑（安装刷机工具）
  - 螺丝刀（拆卸外壳）
  - 金属镊子或金属丝（短接刷机触点）
- **软件**：
  - WindTerm_2.7.0（SSH远程工具）
  - DriverAssitant_v5.12（瑞芯微驱动）
  - RkDevTool_v2.84（瑞芯微开发工具）
  - MiniLoaderAll.bin（引导程序）
  - fnos_Mainland-PE_arm_1.0.0_rk3566-null_258.img（fnOS系统固件）

## 刷机步骤

### 拆开网心云 OECT 设备

按箭头向下滑动打开盖板
![向下滑动打开盖板](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260606234201088.jpg)
拧下四颗螺丝向上推动将盖拆开
![四颗螺丝](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260606234320935.jpg)
再拧下内部十一颗螺丝
![十一颗螺丝](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260606234644275.jpg)
取出SATA硬盘接口小版
![SATA硬盘接口](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260606234801659.jpg)
就可以取下内部盖版

### 刷入 fnOS ARM 版固件

将下载好的 fnOS ARM 系统固件刷入OECT。具体步骤如下：

- 打开 `DriverAssitant_v5.12` → `DriverInstall.exe` 安装驱动
- 打开 `RkDevTool_v2.84`，导入 `MiniLoaderAll.bin` 引导程序和 `fnos_Mainland-PE_arm_1.0.0_rk3566-null_258.img` 系统固件
  ![引导程序和底层系统固件](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260924223843332.png)

- 短接刷机触点
  1、2 短接点只要短接其中一个即可，建议短接1点刷机成功的概率高一些
  ![短接刷机触点](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260607001622431.jpg)

- 用 USB Type-C 数据线连接设备底部的 USB Type-c 接口
  ![Type-c接口](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260607001659180.jpg)

- 三秒后松开短接点，软件就会显示发现一个MASKPROM设备
  ![MASKPROM设备](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260924223921034.png)

- 点击 `执行` 刷入引导程序和底层系统固件
  ![执行](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260607002648086.png)

- 待刷好，给设备通上电并插入网线链接路由器

### 进入路由器查看访问IP地址

查找名为 `trim-3032` 或者 `fnos` 的设备，并记下其 IP 地址
![trim-3032IP](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260924224040193.png)

## 注册登录 fnOS

- 浏览器输入 IP 访问 Web 页面，注册账号登录
  ![欢迎页](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260924224910599.png)
- 设置 `设备名称`、`设置帐号`、`设置密码`
  ![注册账号](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260924225101939.png)

  ![首页](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260924225237473.png)

## 应用推荐

- 飞牛影视：刮削海报墙，家庭影音主力。
- 飞牛相册：人脸/相册分类，手机备份替代云盘。
- Docker：继续跑 qBittorrent、Alist、青龙。
- SMB 共享：电脑、Apple TV、播放器直接读。

## 总结

OECT 刷 fnOS 之后，就是台低功耗级别的家庭私有云：内网 SMB 备份、相册同步、轻量影音、Docker 跑点小服务，比吃灰强一百倍。如果你手里也有闲置的 OECT，不妨跟着教程试试，体验一下自己动手打造家庭云的乐趣！

需要注意的是，刷机有一定风险，请谨慎操作，并确保你已经备份了重要的数据。同时，刷机前确认拿的是 ARM 适配包，不是官网 X86 固件，如果首次启动进不去网页就 SSH 看端口。本文提供的信息仅供参考，具体的刷机过程可能因设备和系统版本的不同而有所差异。祝你刷机顺利！

---

请关注公众号，并回复`“网心云fnOS”`以获取相关资源。
![微信公众号](https://cdn.jsdmirror.com/gh/MingTechPro/drawing-bed/avatar-bg_url/202405061722781.png)
