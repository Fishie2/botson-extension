
/**
 * Get tokens.
 */

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('backgroundjs listener onMessage called')
  sendResponse({});

  var params = Twitter.deparam(request.session);
  Twitter.setOAuthTokens(params, function() {
    Twitter.api('oauth/access_token', 'POST', params, function(res) {
      Twitter.setOAuthTokens(Twitter.deparam(res), function() {});
      chrome.storage.local.set({ 'user_id': hex_sha1(Twitter.deparam(res).user_id) }, function () {});
    });
  });
});
