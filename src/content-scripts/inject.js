const OVERLAY_CONTENT_ID = 'overlay-content'
const OVERLAY_CONTAINER_ID = 'overlay-container'
const OVERLAY_CONTAINER_SELECTOR = '#' + OVERLAY_CONTAINER_ID
const OVERLAY_CONTENT_SELECTOR = '#' + OVERLAY_CONTENT_ID
const TWEET_TEXT_CLASS = 'tweet-text'
const TWEET_TEXT_SELECTOR = '.' + TWEET_TEXT_CLASS

chrome.extension.sendMessage({}, function(response) {
    console.log("chrome extension sendMessage called")
	var readyStateCheckInterval = setInterval(function() {
         console.log("interval function called")
         if (document.readyState === "complete") {
              clearInterval(readyStateCheckInterval);

              /**
              * Start.
              */

              /**
                * add overlay to screen
                */
              const overlayContent = document.createElement('div')
              overlayContent.setAttribute('id', OVERLAY_CONTENT_ID)
              const overlayContainer = document.createElement('div')
              overlayContainer.setAttribute('id', OVERLAY_CONTAINER_ID)
              overlayContainer.appendChild(overlayContent)

              const body = document.querySelector('body')
              body.appendChild(overlayContainer)
              // body.app

              chrome.storage.local.get(['oauth_token', 'oauth_token_secret', 'user_id'], function(items) {
                     console.log('inject.js get oauth tokens called', items)
                     if (!items.oauth_token || !items.oauth_token_secret) return;
                     refresh(items);
                     setInterval(function() { return refresh(items) }, 6000000); // don't repeat the interval for like 6mil seconds lol.
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
                                                       console.log("updateUI called", tweets, threshold)
                                                       threshold = threshold || 0.6;
                                                       addFishyDomToTweets(tweets)
                                                       }
              /**
                  * On slider change, then update UI.
                  */

              chrome.storage.onChanged.addListener(function(changes, namespace) {
                                                                                    console.log('chromeStore onChanged listener called')
                                                                                    for (key in changes) if (key === 'threshold' && changes.threshold.newValue) {
                                                                                    updateUI(changes.threshold.newValue);
                                                                                    }
                                                                                    });

              /**
               * Format user dictionary into tiny pieces.
               */


              /*
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
                 console.log('addFishyDomToTweetCalled 1', tweet, tweetText, link, userId)
                 getFishyOverlay(userId, tweetText, link).then(fishyOverlayDom => {
                     getFishyButton(userId, tweetText, link).then(fishyButtonDom => {
                         console.log('addFishyDomToTweetCalled 1', tweet, fishyButtonDom, fishyOverlayDom, link, userId)
                         addClickableFishyActionToTweet(tweet, fishyButtonDom, fishyOverlayDom)
                     })
                 })
             }

             /**
              *
              * @param tweet
              * @returns the textContent of the tweet as a String. does not return the link
              *  OR
              *  @returns undefined if the tweet does not have the tweet text dom element
              */
             function getTextFromTweet(tweet){
                 const tweetTextDom = tweet.querySelector(TWEET_TEXT_SELECTOR)
                 if (!tweetTextDom) {
                     console.error('there is no tweettext for ', tweet)
                     return
                 }
                 const tweetText = tweetTextDom.textContent
                 return tweetText
             }

             /**
              *
              * @param tweet
              * @returns the link of the tweet as a String
              *  OR
              *  @returns undefined if the tweet has no link or no tweet text element
              */
             function getLinkFromTweet(tweet){
                 const tweetTextDom = tweet.querySelector(TWEET_TEXT_SELECTOR)
                 if (!tweetTextDom) {
                     console.error('getLinkfromtweet no tweetTextDom found for ', tweet)
                     return
                 }
                 const tweetTextDomLink = tweetTextDom.querySelector('a')
                 if (!tweetTextDomLink) {
                     return
                 }
                 const tweetLinkText = tweetTextDomLink.getAttribute('data-expanded-url')
                 return tweetLinkText
             }
             /**
              *
              * @param tweet
              * @returns the userId of the tweet as a String
              */
             function getUserIdFromTweet(tweet){
                 const dataUserId = tweet.getAttribute('data-user-id')
                 return dataUserId
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
                         if (tweetText) {
                             createHighlightedTweetSection(tweetText).then(tweetSection => {
                                 overlayDom.appendChild(tweetSection)
                                 if (link) {
                                     createLinkSection(link).then(linkSection => {
                                         overlayDom.appendChild(linkSection)
                                         resolve(overlayDom)
                                     })
                                 } else {
                                     resolve(overlayDom)
                                 }
                             })
                         } else {
                             resolve(overlayDom)
                         }
                     })
                 })
             }

             /**
              *
              * @param userId
              * @returns userSectionDom - Promise<HTMLElement>
              *  calls the bot detection API, gets the bot percent chance (between 0 and 100), and creates appropriate dom based on that
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
                     /** add the classes that twitter has been adding on its buttons */
                     button.classList.add('ProfileTweet-actionButton')
                     button.classList.add('u-textUserColorHover')
                     button.classList.add('js-actionButton')
                     // button.classList.add('js-actionShareViaDM')
                     const iconContainer = document.createElement('div')
                     iconContainer.classList.add('IconContainer') // = document.createElement('div')
                     iconContainer.classList.add('js-tooltip') // = document.createElement('div')
                     const iconSpan = document.createElement('span')
                     // iconSpan.classList.add('Icon')
                     // iconSpan.classList.add('Icon--medium')
                     // iconSpan.classList.add('Icon--discover')
                     // const button = document.createElement('button')
                     iconSpan.classList.add('Icon')
                     iconSpan.classList.add('Icon--medium')
                     iconSpan.classList.add('Icon--fishy')
                     iconContainer.appendChild(iconSpan)
                     button.appendChild(iconContainer)
                     // const textElement = document.createTextNode('Fishy Stats')
                     // button.appendChild(textElement)
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
                 const ACTION_LIST_CLASS = 'ProfileTweet-actionList'
                 const ACTION_LIST_SELECTOR = '.' + ACTION_LIST_CLASS
                 const actionList = tweet.querySelector(ACTION_LIST_SELECTOR)
                 console.log('actionList')
                 if (!actionList) {
                     console.error('addClickableFishyActionToTweet actionList for ', tweet, ' could not be found')
                     return
                 }
                 console.log('addClickableFishyActionToTweet START actionList count ', actionList.childElementCount)
                 // ProfileTweet-actionList
                 /** remove previously made (if it exists) action to tweet */
                 /*
                 this function may have previously been called for this tweet
                 meaning the fishy action dom may already exist . . .
                 if that is the case we should delete the current fishy dom . . so that we don't get w+ icons at the button action menu
                 */
                 const ACTION_CLASS = 'ProfileTweet-action'
                 const FISHY_ACTION_CLASS = ACTION_CLASS + '--fishy'
                 // const previouslyMadeFishyActionDom = tweet.querySelector('.' + FISHY_ACTION_CLASS)
                 // tweet.removeChild(previouslyMadeFishyActionDom)

                 /** add FishyAction to tweet */
                 const fishyActionDom = document.createElement('div')
                 fishyActionDom.classList.add(ACTION_CLASS)
                 fishyActionDom.classList.add(FISHY_ACTION_CLASS)
                 fishyActionDom.appendChild(button)
                 // TODO: somehow make onclick on button display the overlay
                 fishyActionDom.addEventListener('click', () => {
                     // displayOverlay()
                     // displayOverlay()
                     displayOverlay(overlayContainer, overlayContent, overlay)
                     // displayOverlay(overlayContainer)
                     alert('fishy clicked!')
                 })
                 actionList.appendChild(fishyActionDom)
                 console.log('addClickableFishyActionToTweet END actionList count ', actionList.childElementCount)
             }

             function displayOverlay(overlayContainer, overlayContent, overlayInnerElement){
                 console.log('displayOverlay called!!')
                 console.log('overlayGoingToBeDisplayed is overlayInnerElement', overlayInnerElement)
                 overlayContent.innerHTML = overlayInnerElement.outerHTML
                 overlayContainer.style.display = "block";
             }








         }



    }, 10);





});
