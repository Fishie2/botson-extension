chrome.extension.sendMessage({}, function(response) {
    console.log("chrome extension sendMessage called")
	var readyStateCheckInterval = setInterval(function() {
	  console.log("interval function called")
  	if (document.readyState === "complete") {
  		clearInterval(readyStateCheckInterval);

      /**
       * Start.
       */

      chrome.storage.local.get(['oauth_token', 'oauth_token_secret', 'user_id'], function(items) {
        console.log('inject.js get oauth tokens called', items)
        if (!items.oauth_token || !items.oauth_token_secret) return;
        refresh(items);
        setInterval(function() { return refresh(items) }, 5000);
      });

      /**
       * Refresh when new tweets appear in DOM.
       */

      function refresh(auth) {
          console.log('refresh called')
        var users = formatUsers(getUsersFromTimeline());
        if (users.length > 10) { // TODO: why only call if user length is > 10?
          for (var i = 0; i < users.length; i++) {
            getAndSaveScore(users[i], auth);
          }
        }
        update();
      }

      /**
       * Get users dictionary from timeline.
       */

      function getTweetsFromTimeline() {
          var tweets = document.querySelectorAll('div.tweet');
          var users = {};
          for (var i = 0; i < tweets.length; i++) {
              if (tweets[i].getAttribute('data-scraped') === 'true') continue;
              var user_id = tweets[i].getAttribute('data-user-id');
              var screen_name = tweets[i].getAttribute('data-screen-name');
              if (!user_id || !screen_name) continue;
              if (users[user_id]) continue;
              users[user_id] = screen_name;
              tweets[i].setAttribute('data-scraped', 'true');
          }
          return users;
      }
      function getUsersFromTimeline() {
        console.log('getUsersFromTimeline called')
        var tweets = document.querySelectorAll('div.tweet');
        var users = {};
        for (var i = 0; i < tweets.length; i++) {
          if (tweets[i].getAttribute('data-scraped') === 'true') continue;
          var user_id = tweets[i].getAttribute('data-user-id');
          var screen_name = tweets[i].getAttribute('data-screen-name');
          if (!user_id || !screen_name) continue;
          if (users[user_id]) continue;
          users[user_id] = screen_name;
          tweets[i].setAttribute('data-scraped', 'true');
        }
        return users;
      }

      /**
       * Get bot score for user.
       * @param {Object} user { user_id: Number, screen_name: String }
       * @param {Object} auth { oauth_token: String, oauth_token_secret: String }
       */

      function getAndSaveScore(user, auth) {
        console.log('getStore called', user, auth)
        var xhttp = new XMLHttpRequest();
        xhttp.open('POST', 'https://askbotson.herokuapp.com/api/', true);
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.setRequestHeader("x-twitter-oauth-token", auth.oauth_token);
        xhttp.setRequestHeader("x-twitter-oauth-secret", auth.oauth_token_secret);
        if (auth.user_id) xhttp.setRequestHeader("x-twitter-user-id", auth.user_id);
        xhttp.send(JSON.stringify(user));
        xhttp.onload = saveUsers;
      }

      /**
       * Update users.
       */

      function saveUsers(e) {
          console.log('saveUsers called')
        var res = JSON.parse(e.target.response);
        chrome.storage.local.get(null, function(users) {
          if (users[res.user_id]) return;
          users[res.user_id] = { screen_name: res.screen_name, score: res.scores.english };
          chrome.storage.local.set(users);
        });
      }

      /**
       * Update dom with data.
       */

      function addUserScoreToTweets(tweets){
          chrome.storage.local.get(null, function(users) {
            alert('106 addUserScoreToTweets get localStore null key called', users)
              for (var i = 0; i < tweets.length; i++) {
                  for (var userId in users) {
                      if (!users[userId].score || !users[userId].screen_name) continue;
                      if (tweets[i].getAttribute('data-user-id') !== userId.toString()) continue;
                      if (tweets[i].getAttribute('data-bot-score')) continue;
                      tweets[i].setAttribute('data-bot-score', users[userId].score);
                  }
              }
              updateUI(users.threshold);
          });
      }
      function update() {
        console.log(
            'update called'
        )
        var tweets = document.querySelectorAll('div.tweet');
        addUserScoreToTweets(tweets)
      }

      /**
       * Update dom UI.
       */

      function updateUI(threshold) {
        console.log("updateUI called", threshold)
        threshold = threshold || 0.6;
        var tweets = document.querySelectorAll('div.tweet');
        for (var i = 0; i < tweets.length; i++) {
          toggleTweetUI(tweets[i], threshold);
        }
      }

      /**
       * Toggle UI for tweet.
       */

      function toggleTweetUI(tweet, threshold) {
        console.log('toggleTweetUi called', tweet, threshold)
        var score = tweet.getAttribute('data-bot-score');
        var screen_name = tweet.getAttribute('data-screen-name');
        if (score > threshold && !tweet.getAttribute('user-revealed')) {
          if (!tweet.classList.contains('probably-a-bot')) tweet.className += ' probably-a-bot';
          if (!tweet.parentNode.querySelector('.probably-a-bot-mask')) tweet.parentNode.insertBefore(createMask({ score: score, screen_name: screen_name }, tweet.scrollHeight), tweet);
        } else {
          tweet.classList.remove('probably-a-bot');
          if (tweet.parentNode.querySelector('.probably-a-bot-mask')) tweet.parentNode.querySelector('.probably-a-bot-mask').remove();
        }
      }

      /**
       * On slider change, then update UI.
       */

      chrome.storage.onChanged.addListener(function(changes, namespace) {
        console.log('chromeStore onChanged listener called')
        for (key in changes) if (key === 'threshold' && changes.threshold.newValue) updateUI(changes.threshold.newValue);
      });


        /**
         *
         * @param tweet -- htmlElement/div that has the tweet
         */
      function createTooltip(tweet){

      }
        /**
         * Create mask and message div.
         */
      function createMask(user, height) {
        console.log('createMask called', user, height)
        var mask = document.createElement('div');
        var message = document.createElement('div');
        mask.className = 'probably-a-bot-mask';
        message.className = 'probably-a-bot-mask-message-short';
        if (height > 150) message.className = 'probably-a-bot-mask-message-medium';
        if (height > 300) message.className = 'probably-a-bot-mask-message-tall';
        message.innerHTML = 'We are ' + Math.round(100 * user.score) + '% confident that this tweet is from a bot.';
        message.innerHTML += '<p style="font-size: 0.8rem"><a href="#/" class="reveal-tweet">Reveal tweet</a>. <a href="https://botometer.iuni.iu.edu/#!/?sn=' + user.screen_name + '" target="_blank">Learn more about this account</a>.</p>';
        mask.appendChild(message);
        message.childNodes[1].childNodes[0].addEventListener('click', function(e) {
          this.parentNode.parentNode.parentNode.parentNode.childNodes[2].classList.remove('probably-a-bot');
          this.parentNode.parentNode.parentNode.parentNode.childNodes[2].setAttribute('user-revealed', true);
          this.parentNode.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode.parentNode);
        });
        return mask;
      }

      /**
       * Format user dictionary into tiny pieces.
       */

      function formatUsers(users) {
          console.log("format Users called")
        var arr = [];
        for (var property in users) {
          if (users.hasOwnProperty(property)) {
            if (property) arr.push({ user_id: '' + property, screen_name: users[property] });
          }
        }
        return arr;
      }
  	}
	}, 10);
});



