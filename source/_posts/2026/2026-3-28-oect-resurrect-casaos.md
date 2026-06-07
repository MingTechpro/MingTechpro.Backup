---
title: 网心云 OECT 复活计划：刷入 CasaOS 打造轻量家庭服务器
date: 2026-03-28 22:13:21
categories: 硬件折腾
tags: [网心云, OECT, CasaOS, 家庭服务器]
cover:
description: 将吃灰的网心云 OECT 设备通过刷机改造，安装 CasaOS 系统，变废为宝打造轻量级家庭服务器。
abbrlink: c4c3fa0f
---

## 前言

最近收拾抽屉，翻出了之前跑分用的 **网心云 OECT**（One Ecosystem Computing Tool）。这玩意儿当年火过一阵，但现在官方固件收益惨淡，留着也是吃灰。

看着它那颗 RK3566 芯片和 4GB 内存，实在不忍心浪费。于是决定给它来个“大换血”，刷入 **CasaOS**，将其打造成一台低功耗的 **轻量家庭服务器**。

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
  - Flash_Armbian_6.1.99_server.img（底层系统固件）

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

### 刷入 Armbian 底包

将下载好的 Armbian 系统固件刷入OECT，为后续刷机做好准备。具体步骤如下：

- 打开 `DriverAssitant_v5.12` → `DriverInstall.exe` 安装驱动
- 打开 `RkDevTool_v2.84`，导入 `MiniLoaderAll.bin` 引导程序和 `Flash_Armbian_6.1.99_server.img` 底层系统固件
  ![引导程序和底层系统固件](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260606235459256.png)

- 短接刷机触点
  1、2 短接点只要短接其中一个即可，建议短接1点刷机成功的概率高一些
  ![短接刷机触点](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260607001622431.jpg)

- 用 USB Type-C 数据线连接设备底部的 USB Type-c 接口
  ![Type-c接口](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260607001659180.jpg)

- 三秒后松开短接点，软件就会显示发现一个MASKPROM设备
  ![MASKPROM设备](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260607002215096.png)

- 点击 `执行` 刷入引导程序和底层系统固件
  ![20260607002648086](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260607002648086.png)

- 待刷好，给设备通上电并插入网线链接路由器

### 进入路由器查看访问IP地址

查找名为 `armbian` 的设备，并记下其 IP 地址
![armbianIP](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260607161808942.png)

### SSH 远程登录 Armbian 系统

- 使用 WindTerm 通过 IP 登录 Armbian 系统
- 默认账号 `root`
  ![账号](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260607162909086.png)
- 默认密码`1234`
  ![密码](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260607162918371.png)

- `修改登录密码` → `选择命令外壳` → `退出设置新账号`
  ![修改登录密码](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260607163803473.png)

### 更换系统软件源

- 执行一键换源命令

  ```bash
  bash <(curl -ssL <https://linuxmirrors.cn/main.sh>)
  ```

  ![更换系统软件源](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260607165257457.png)

- 选择软件源的服务商
  ![选择阿里云源](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260607165655239.png)

- 选择跳过更新软件包
  ![跳过更新软件包](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260607170138924.png)

### 安装 CasaOS 系统

- 执行 CasaOS 系统安装命令

  ```bash
  wget -qO- https://get.casaos.io | bash
  ```

  ![CasaOS系统安装命令](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260607170600175.png)

- 输入 1(Yes) 同意安装
  ![同意安装](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260607202923222.png)

- 等待安装完成，将看到下方页面
  ![安装完成](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260607203249010.png)

## 注册登录 CasaOS

- 浏览器输入 IP 访问 Web 页面，注册账号登录
  ![注册账号](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260607203439282.png)
  ![登录](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260607203454857.png)

## 总结

通过这次折腾，不仅让吃灰的设备重新焕发了生机，还顺便给家里省了一台 24 小时开机的树莓派。如果你手里也有闲置的 OECT，不妨跟着教程试试，体验一下自己动手打造家庭云的乐趣！

需要注意的是，刷机有一定风险，请谨慎操作，并确保你已经备份了重要的数据。同时，本文提供的信息仅供参考，具体的刷机过程可能因设备和系统版本的不同而有所差异。祝你刷机顺利！

---

请关注公众号，并回复`“网心云CasaOS”`以获取相关资源。
![微信公众号](https://cdn.jsdmirror.com/gh/MingTechPro/drawing-bed/avatar-bg_url/202405061722781.png)
