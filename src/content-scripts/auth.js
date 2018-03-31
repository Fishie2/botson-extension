
/**
 * Get and send oauth tokens from query string.
 */

console.log('auth.js called')
chrome.runtime.sendMessage({type: 'auth', session: window.location.search.substr(1)}, function(response) {
	console.log('auth.js calledback called')
	window.open('', '_self', '');
	window.close();
});
