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
    var queryPromise = new Promise(function (resolve, reject){
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
            hostName = splitArr[arr-2]+'.'+splitArr[arrLen-1];
            if(splitArr[arrLen-2].length == 2 && splitArr[arrLen-1].length == 2) {
                hostName = splitArr[arrLen-3]+'.'+domain;
            }
        }
        
        }
    
        return new Promise(function(resolve, reject){
            $.getJSON("https://raw.githubusercontent.com/BigMcLargeHuge/opensources/master/sources/sources.json", function(data){
                hasProperty = true;
                if(typeof hasProperty['hostname'] === undefined){
                    hasProperty = false;    
                }
                resolve(hasProperty);
            });
        }
    
    
    
}