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
        update();
      }

      /**
       * Update users.
       */

      function update() {
        console.log(
            'update called'
        )
        var tweets = document.querySelectorAll('div.tweet');
        updateUI(tweets)
      }

      /**
       * Update dom UI.
       */

      function updateUI(tweets, threshold) {
        console.log("updateUI called", threshold)
        threshold = threshold || 0.6;
        addFishyDomToTweets(tweets)

          // OLD LOGIC BELOW
        // var tweets = document.querySelectorAll('div.tweet');
        // for (var i = 0; i < tweets.length; i++) {
        //   toggleTweetUI(tweets[i], threshold);
        // }
      }
      /**
       * On slider change, then update UI.
       */

      chrome.storage.onChanged.addListener(function(changes, namespace) {
        console.log('chromeStore onChanged listener called')
        for (key in changes) if (key === 'threshold' && changes.threshold.newValue) updateUI(changes.threshold.newValue);
      });

      /**
       * Format user dictionary into tiny pieces.
       */

  	}
	}, 10);
});

/**
 *
 * @param tweets - Array<HTMLElement>
 */
function addFishyDomToTweets(tweets) {
    console.log('tweets in addFishyDomToTweets is', tweets)
    for (const tweet of tweets){
        addFishyDomToTweet(tweet)
    }
}
/**
 *
 * @param tweet - HTMLElement
 */
function addFishyDomToTweet(tweet) {
    const tweetText = getTextFromTweet(tweet)
    const link = getLinkFromTweet(tweet)
    const userId = getUserIdFromTweet(tweet)
    getFishyOverlay(userId, tweetText, link).then(fishyOverlayDom => {
        getFishyButton(userId, tweetText, link).then(fishyButtonDom => {
            addClickableFishyActionToTweet(tweet, fishyButtonDom, fishyOverlayDom)
        })
    })
}

/**
 *
 * @param tweet
 * @returns the textContent of the tweet as a String. does not return the link
 */
function getTextFromTweet(tweet){

}

/**
 *
 * @param tweet
 * @returns the link of the tweet as a String
 */
function getLinkFromTweet(tweet){

}
/**
 *
 * @param tweet
 * @returns the userId of the tweet as a String
 */
function getUserIdFromTweet(tweet){

}

/**
 *
 * @param userId - string
 * @param tweetText - string
 * @param link - string
 *
 * @returns overlayDOM - Promise<HTMLElement>
 *
 */
function getFishyOverlay(userId, tweetText, link){
    return new Promise((resolve, reject) => {
        const overlayDom = document.createElement('div')
        createUserSection(userId).then(userSection => {
            overlayDom.appendChild(userSection)
            createHighlightedTweetSection(tweetText).then(tweetSection => {
                overlayDom.appendChild(tweetSection)
                createLinkSection(link).then(linkSection => {
                    overlayDom.appendChild(linkSection)
                    resolve(overlayDom)
                })
            })
        })
    })
}

/**
 *
 * @param userId
 * @returns userSectionDom - Promise<HTMLElement>
 */
function createUserSection(userId){
  // TODO: replace this with dynamically created HTML

    // sample hardcoded string
    const section = document.createElement('div');
    const sampleText = document.createTextNode('This user is 50% chance a bot yo')
    section.appendChild(sampleText)
    return new Promise((resolve, reject) => {
      resolve(section)
    })
}

/**
 * @param tweetText - string
 * @returns element - Promise<HTMLElement>
        - this html element underlines certain sections of the data with between 0 and 3 colors. Each underline color represents one of the Perspective Api categories.
 */
function createHighlightedTweetSection(tweetText){
    // TODO: replace this with dynamically created HTML

    // sample hardcoded string
    const section = document.createElement('div');
    const sampleText = document.createTextNode('Some html with highlighted tweet should go here')
    section.appendChild(sampleText)
    return new Promise((resolve, reject) => {
        resolve(section)
    })
}
/**
* @param link - string - e.g.  "http://breitbart.com/somefakearticle123.html"
* This function calls the OpenSources API to classify the link
*   >>> It really might actually just call some json file with the classification, meaning we technically don't have to return a promise . . . Just let me know if it is a promise or not. Currently I (John) am coding it as if it is a promise
* @returns element - Promise<HTMLElement>
        - this html element has text that classifies the type of news source.
**/
function createLinkSection(tweetText){
    // TODO: replace this with dynamically created HTML

    // sample hardcoded string
    const section = document.createElement('div');
    const sampleText = document.createTextNode('some shit about how reliable the link is ')
    section.appendChild(sampleText)
    return new Promise((resolve, reject) => {
        resolve(section)
    })
}

/**
 *
 * // TODO: this might have different params
 * @param userId
 * @param tweetText
 * @param link
 *
 * @returns buttonDOM - Promise<HTMLElement>
 *
 */
function getFishyButton(userId, tweetText, link){
    // TODO: change color of button based on how fucked up the tweet is
    return new Promise((resolve, reject) => {
        const button = document.createElement('button')
        const textElement = 'Fishy Stats'
        button.appendChild(textElement)
        resolve(button)
    })
}


/**
 *
 * @param tweet - HTMLElement
 * @param button- HTMLElement
 * @param overlay- HTMLElement
 */
function addClickableFishyActionToTweet(tweet, button, overlay){
    const actionList = tweet.querySelector('.ProfileTweet-actionList')
    /** remove previously made (if it exists) action to tweet */
    /*
    this function may have previously been called for this tweet
    meaning the fishy action dom may already exist . . .
    if that is the case we should delete the current fishy dom . . so that we don't get w+ icons at the button action menu
    */
    const TWITTER_ACTION_CLASS = 'ProfileTweet-action'
    const FISHY_ACTION_CLASS = TWITTER_ACTION_CLASS + '--fishy'
    const previouslyMadeFishyActionDom = tweet.querySelector('.' + FISHY_ACTION_CLASS)
    tweet.removeChild(previouslyMadeFishyActionDom)

    /** add FishyAction to tweet */
    const fishyActionDom = document.createElement('div')
    fishyActionDom.classList.add(TWITTER_ACTION_CLASS)
    fishyActionDom.classList.add(FISHY_ACTION_CLASS)
    fishyActionDom.appendChild(button)
    // TODO: somehow make onclick on button display the overlay
    actionList.appendChild(fishyActionDom)
}
