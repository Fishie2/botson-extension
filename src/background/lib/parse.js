/* Global Variables */

var category = ["SAFE","QUESTIONABLE","UNSAFE"];
Object.freeze(category);

//@TODO: Is this safe to put the key here?
var key = "AIzaSyD0CBXaJ7trnGq8iD1qEzgpoRNajGnneIs";
var url = "https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key="  + key;
/** Parses a message through the fishie score and returns HTML to print in report. 
* @param - message - A string that refers to the message text of the tweet.
* @return HTMLRet - The full HTML of the response, with a leading term from category.
*/
function parseThroughPerspective(message){
     let queryPromise = new Promise(function (resolve, reject){
        /*
            Perspective API Section
        */
        //Build Request
        var xhr = new XMLHttpRequest();   // new HttpRequest instance 
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onload = (response) => {
            var myData = JSON.parse(response.target.response);
            resolve(myData)
        }
        xhr.onerror = reject;

        //Generate Request for Perspective API
        var request = {};
        request.comment = {};
        request.comment.text = message;
        request.languages = ["en"];
        request.requestedAttributes = {TOXICITY_FAST:{}};
        request = JSON.stringify(request);

        xhr.send(request);        
    });
    
    
    return queryPromise.then(function(ret){
            
            let div = document.createElement("div");
            let scoreArray = ret.attributeScores.TOXICITY_FAST.spanScores; 
            for(let i=0;i<scoreArray.length;i++){
                let currentSpan = document.createElement("span");
                currentSpan.innerHTML = message.substring(scoreArray[i].begin, scoreArray[i].end);
                if(scoreArray[i].score.value > 0.5){
                    currentSpan.setAttribute("style","text-decoration: underline;");    
                }
                div.appendChild(currentSpan);    
            }
            return div;
            
        },);
}
function isFlaggedSource(link) {
        var hostname;
        if(url.indexOf("://") > -1){
            hostname = link.split('/')[2];
        }
        else{
            hostname=url.split('/')[0];
        }
        //Find and remove port number
        hostname = hostname.split(':')[0];
        hostname = hostname.split('?')[0];
        let splitArr = hostname.split('.');
        arrLen = splitArr.length;
        if(arrLen > 2){
            hostName = splitArr[arrLen-2]+'.'+splitArr[arrLen-1];
            if(splitArr[arrLen-2].length == 2 && splitArr[arrLen-1].length == 2) {
                hostName = splitArr[arrLen-3]+'.'+domain;
            }
        }
        console.log(hostname);
        return new Promise(function(resolve, reject){
            $.getJSON("https://raw.githubusercontent.com/BigMcLargeHuge/opensources/master/sources/sources.json", function(data){
                if(typeof data[hostname] === undefined){
                    resolve(null);
                    
                        
                }
                else{
                      let div = document.createElement("div");
                    div.classList.add("fishie-link");
                    let span = document.createElement("span");
                    span.classList.add("fishie-link-classification-container");
                    span.innerHTML = "This link is classified as: ";
                    div.appendChild(span);
                    let type = document.createElement("b");
                    type.innerHTML = data[hostname].type;
                    span.appendChild(type);
                    
                    if(data[hostname]['2nd type'] !== ""){
                        type = type.cloneNode();
                        type.innerHTML = data[hostname]['2nd type'];
                        span.appendChild(type);
                    }
                    
                    if(data[hostname]['3rd type'] !== ""){
                        type = type.cloneNode();
                        type.innerHTML = data[hostname]['3rd type'];
                        span.appendChild(type);
                    }
                    resolve(div);  
                }
            });
        });
    
    
    
}
/**
 *
 * @param userId
 * @returns userSectionDom - Promise<HTMLElement>
*  calls the bot detection API, gets the bot percent chance (between 0 and 100), and creates appropriate dom based on that
 */
function createUserSection(userId,screen_name){
    /*
  // TODO: replace this with dynamically created HTML
    let querryPromise = new Promise(function(resolve, reject){
        /*
            Perspective API Section
        
        //Build Request
        Twitter.isLoggedIn(function(auth) {
            if (auth.oauth_token && auth.oauth_token_secret) {
                var xhttp = new XMLHttpRequest();
                xhttp.open('POST', 'https://askbotson.herokuapp.com/api/', true);
                xhttp.setRequestHeader("Content-Type", "application/json");
                xhttp.setRequestHeader("x-twitter-oauth-token", auth.oauth_token);
                xhttp.setRequestHeader("x-twitter-oauth-secret", auth.oauth_token_secret);
                if (auth.user_id) xhttp.setRequestHeader("x-twitter-user-id",userId);
                let user = {};
                user[userId] = screen_name;
                xhttp.onload = (response)=>{
                    resolve(response.target.response);    
                }
                xhttp.onerror = reject;
                xhttp.send(JSON.stringify(user)); 
            } 
           
            
  else {
    return Twitter.authenticate();
  }
});     
    });
    return querryPromise.then(function(ret){
        let section = document.createElement('div');
        console.log(ret);
	   let sampleText = document.createTextNode('' + ret);
        section.appendChild(section);

        });*/
                                    
    const section = document.createElement('div');
    let chance = Math.floor(Math.random()*100);
    const sampleText = document.createTextNode('This user is ' + chance + '% chance a bot yo')
    section.appendChild(sampleText)
    return new Promise((resolve, reject) => {
      resolve(section)
    })

}
