---
title: 站点状态
date: 2024-05-03 19:57:53
layout: status
todayPV: 今日总访问量
todayUV: 今日访客总数
echarts: true
---

<!-- 文章发布时间统计图 -->
<div id="posts-chart" data-start="2023-10" style="border-radius: 8px; height: 300px; padding: 10px; width: 100%;"></div>
<!-- 文章标签统计图 -->
<div id="tags-chart" data-length="10" style="border-radius: 8px; height: 300px; padding: 10px; width: 100%;"></div>
<!-- 文章分类统计图 -->
<div id="categories-chart" style="border-radius: 8px; height: 300px; padding: 10px; width: 100%;"></div>

{% note success flat %}
网站信息功能实现参考于 [Hexo Butterfly 添加站点状态页：运行天数与访客数据可视化教程](/posts/26d8c5dc/)
{% endnote %}

{% note info flat %}
图表功能实现参考于 [Hexo Butterfly 引入 ECharts：添加动态数据可视化图表](/posts/5805731a/)
{% endnote %}

{% note danger flat %}
<font color=Red>特别注意：</font>如使用 Cloudflare 解析域名，请不要打开 `Rocket Loader™` 否则将无法正常显示图表
{% endnote %}
