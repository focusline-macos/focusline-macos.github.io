/* Open App Store links in the Mac App Store app when browsing on a Mac;
 * everyone else keeps the regular apps.apple.com web page. */
(function () {
  var isMac = /Mac/.test(navigator.platform) && !("ontouchend" in document);
  if (!isMac) return;
  document.querySelectorAll('a[href*="apps.apple.com"]').forEach(function (a) {
    a.href = a.href.replace(/^https?:\/\//, "macappstore://");
  });
})();
