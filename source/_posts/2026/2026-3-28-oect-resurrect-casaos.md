---
title: 网心云 OECT 复活计划：刷入 CasaOS 打造轻量家庭服务器
date: 2026-06-06 22:13:21
categories: 硬件折腾
tags: [网心云, OECT, CasaOS, 家庭服务器]
cover:
description: 将吃灰的网心云 OECT 设备通过刷机改造，安装 CasaOS 系统，变废为宝打造轻量级家庭服务器。
abbrlink: c4c3fa0f
---

## 前言

最近收拾抽屉，翻出了之前跑分用的 **网心云 OECT**（One Ecosystem Computing Tool）。这玩意儿当年火过一阵，但现在官方固件收益惨淡，留着也是吃灰。

看着它那颗 RK3566 芯片和 4GB 内存，实在不忍心浪费。于是决定给它来个“大换血”，刷入当下流行的 **CasaOS**，将其打造成一台低功耗的 **轻量家庭服务器**。

## 准备工作

在开始之前，请准备好以下工具：

- **硬件**：
  - 网心云 OECT 设备（确保能正常通电）
  - 一条 USB Type-C 数据线（用于线刷）
  - 电脑（安装刷机工具）
  - 螺丝刀（拆卸外壳）
  - 金属镊子或金属丝（短接刷机触点）
- **软件**：
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

### 刷入 ArmBian 底包

将下载好的 ArmBian 系统固件刷入OECT，为后续刷机做好准备。具体步骤如下：

- 打开 `DriverAssitant_v5.12` → `DriverInstall.exe` 安装驱动
- 打开 `RkDevTool_v2.84`，导入 `MiniLoaderAll.bin` 引导程序和 `Flash_Armbian_6.1.99_server.img` 底层系统固件
  ![引导程序和底层系统固件](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260606235459256.png)

- 短接刷机触点
  1、2 短接点只要短接其中一个即可，建议短接1点刷机成功的概率高一些
  ![短接刷机触点](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260607001622431.jpg)

- 用 USB Type-C 数据线链接设备底部的 USB Type-c 接口
  ![Type-c接口](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260607001659180.jpg)

- 三秒后松开短接点，软件就会显示发现一个MASKPROM设备
  ![MASKPROM设备](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260607002215096.png)

- 点击 `执行` 刷入引导程序和底层系统固件
  ![20260607002648086](https://cdn.jsdmirror.com/gh/MingTechpro/drawing-bed/post-img_url/20260607002648086.png)
  等待刷好，给设备通上电并插入网线链接路由器
