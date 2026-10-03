// hexo-offline.config.cjs
// Hexo 8.1.2 + Butterfly 5.7.0 + Waline(TiDB) + 统计 + jsDelivr
module.exports = {
  globDirectory: "public",
  globPatterns: [
    "**/*.{html,js,css,png,jpg,jpeg,gif,svg,webp,ico,eot,ttf,woff,woff2,pdf,json,xml}",
  ],
  swDest: "public/service-worker.js",
  maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,

  skipWaiting: true,
  clientsClaim: true,
  cleanupOutdatedCaches: true,
  directoryIndex: "index.html",

  // 不写 navigateFallback，离线没缓存的页面就是浏览器断网提示
  ignoreURLParametersMatching: [
    /^utm_/,
    /^fbclid/,
    /^gclid/,
    /^from/,
    /^spm/,
    /^v$/,
  ],

  navigateFallback: "/404.html",

  runtimeCaching: [
    // 页面：网络优先，失败用缓存
    {
      urlPattern: ({ request }) => request.mode === "navigate",
      handler: "NetworkFirst",
      options: {
        networkTimeoutSeconds: 3,
        cacheName: "html-pages",
        cacheableResponse: { statuses: [0, 200] },
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 7 * 24 * 60 * 60,
        },
      },
    },

    // Waline 后端全不缓存
    {
      urlPattern: /^https:\/\/waline\.mingtechpro\.top\/api\/.*/,
      handler: "NetworkOnly",
    },
    {
      urlPattern: /^https:\/\/waline\.mingtechpro\.top\/ui\/.*/,
      handler: "NetworkOnly",
    },
    {
      urlPattern: /^https:\/\/waline\.mingtechpro\.top\/oauth\/.*/,
      handler: "NetworkOnly",
    },

    // jsDelivr：锁版本资源用 StaleWhileRevalidate
    {
      urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "cdn-jsdelivr",
        cacheableResponse: { statuses: [0, 200] },
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        },
      },
    },

    // 图片 CacheFirst
    {
      urlPattern: /\.(?:png|jpg|jpeg|gif|webp|svg)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "images",
        cacheableResponse: { statuses: [0, 200] },
        expiration: {
          maxEntries: 150,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        },
      },
    },

    // 统计全 NetworkOnly
    { urlPattern: /^https:\/\/hm\.baidu\.com\/.*/, handler: "NetworkOnly" },
    {
      urlPattern: /^https:\/\/(www|ssl)\.google-analytics\.com\/.*/,
      handler: "NetworkOnly",
    },
    {
      urlPattern: /^https:\/\/analytics\.google\.com\/.*/,
      handler: "NetworkOnly",
    },
    { urlPattern: /^https:\/\/www\.clarity\.ms\/.*/, handler: "NetworkOnly" },
    {
      urlPattern: /^https:\/\/busuanzi\.ibruce\.info\/.*/,
      handler: "NetworkOnly",
    },
  ],
};
