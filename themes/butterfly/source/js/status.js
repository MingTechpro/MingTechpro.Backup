(function () {
  /**
   * 仅在 status 页面执行
   */
  if (location.pathname.replace(/\/+$/, "") !== "/status") return;

  /**
   * 网页运行时间
   */

  const addRuntime = () => {
    const $runtimeCount = document.getElementById("status-runtimeshow");
    if (!$runtimeCount) return;

    const publishDate = $runtimeCount.getAttribute("data-publishDate");
    if (!publishDate) return;

    $runtimeCount.textContent = `${btf.diffDate(publishDate)} ${GLOBAL_CONFIG.runtime}`;
  };

  /**
   * 最后一次更新时间
   */
  const addLastPushDate = () => {
    const $lastPushDateItem = document.getElementById("status-last-push-date");
    if (!$lastPushDateItem) return;

    const lastPushDate = $lastPushDateItem.getAttribute("data-lastPushDate");
    if (!lastPushDate) return;

    $lastPushDateItem.textContent = btf.diffDate(lastPushDate, true);
  };

  /**
   * status 页面专属刷新函数
   */
  const refreshStatusFn = () => {
    addRuntime();
    addLastPushDate();
  };

  /**
   * 首次加载执行
   */
  const boot = () => {
    if (window.btf) {
      refreshStatusFn();
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
