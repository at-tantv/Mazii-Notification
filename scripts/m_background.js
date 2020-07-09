// Copyright (c) 2020 HTT Dev Inc. All rights reserved.
/**
 * Author: at-tantv
 * Create at: 2020/07/07
 * Version: 1.0.1
 * Descriptions: Working with notitication class
 */

/*Define variable of program */
let timer;                      // Timer for loop
let timerInterval = 10 * 1000;  // Time interval setting (seconds)
let listIdNotification = [];    // Contains list id of list notification

/***************************************************************************/
/*BEGIN PROGRAM */
initSystemDefault();
initGUI();
registerEventListener();
startProgram();
/*END PROGRAM */
/***************************************************************************/

/***************************************************************************/
/**
* Init System Default
*/
function initSystemDefault() {
  /* Event: Runs when extension is installed */
  chrome.runtime.onInstalled.addListener(function() {
    // Init default settings into storage
    chrome.storage.local.set({ interval: 10000 }, null);
    chrome.storage.local.set({ is_display_notification: true }, null);
  });

  /* Event: Runs when background receives a message */
  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      // Get latest settings from storage
      chrome.storage.local.get(null, function(data) {
        var error = chrome.runtime.lastError;
        if (error){
            return;
        }
        timerInterval = parseInt(data.interval);
      });
      // Execute action
      if (request.action == "start_or_stop") {
        startOrStopClicked();
      }
      // Note: This is required even when we're not sending anything back.
      sendResponse();
    }
  );
}

/**
* Create GUI
*/
function initGUI(){
  // Create Context Menus
  createContextMenus();
}

/**
* Register Event Listener
*/
function registerEventListener(){
  // Add Event notification
  registerEventNotificationClicked();
}

/**
* Start PROGRAM
*/
function startProgram(){
    let error = chrome.runtime.lastError;
    if (error){
        notify(notify_title,"Has error when start Program ! Please try again !");
        return;
    }
    startAutomation();
    chrome.storage.local.set({ is_started: true });
}

/***************************************************************************/
/**
* Loop Timer
*/
function onTimerElapsed() {
  getListLinkUrlFromStorage(function(listLinkUrl){
      if (listLinkUrl.length > 0){
          for (i = 0; i < listLinkUrl.length; i++) {
              let postId = listLinkUrl[i].id;
              callAPIgetCommentsByPostId(postId, function(data){
                  getLastestCommentInformation(data)
              });
          }
      }
  })
}

/**
* Save New Link When User Added
*/
function saveNewLinkUrl(linkUrl){
  let postId = getPostIdByLinkUrl(linkUrl);
  if (postId == null){
     notify(notify_title,"URL invalid. Please check again ! ");
     return;
  }
  savePostDetailToStorage(postId)
}

/**
* Get Lastest Comment Information
*/
function getLastestCommentInformation(data){
  let jsonData = JSON.parse(data);
  if (jsonData){
     let id = jsonData["id"];
     //let user = jsonData["user"];
     let comments = jsonData["comments"];
     savePostDetailToStorage(id, comments, true)
  }
}

/**
* save Post Detail To Storage
*/
function savePostDetailToStorage(id, comments, isCheckNewComment){
   let lastUserInfo = null;
   let updateAt = null;
   let lastUserName = "";
   let profile = null;
   let avatar = "";
   let countComment = 0;
   let listComments = [];
   if (comments){
      countComment = comments.length;
      if (countComment > 0){
          let lastCommentInfo = comments[countComment - 1];
          if (lastCommentInfo){
              lastUserInfo = lastCommentInfo["user"];
              updateAt = lastCommentInfo["updated_at"];
              if (lastUserInfo){
                  lastUserName = lastUserInfo["username"];
                  profile = lastUserInfo["profile"];
                  if (profile){
                      avatar = profile["image"];
                  }
              }
          }

          let i;
          for (i = 0; i < countComment; i++){
              let commentInfo = comments[i];
              let tmpCommentObject = {};
              if (commentInfo){
                  tmpCommentObject.id = commentInfo.id;
                  tmpCommentObject.create_at = commentInfo.create_at;
                  let user = commentInfo["user"];
                  if (user){
                      tmpCommentObject.username = user.username;
                      let profile = user["profile"];
                      if (profile){
                          tmpCommentObject.avatar = user.image;
                      }
                  }
                  let pairComment = commentInfo["par_comment"];
                  if (pairComment && pairComment.length > 0){
                      let lastPairComment = {};
                      let lastPairInfo = pairComment[pairComment.length - 1];
                      lastPairComment.id = lastPairInfo.id;
                      lastPairComment.create_at = lastPairInfo.create_at;
                      let pairUser = lastPairInfo.user;
                      if (pairUser){
                          lastPairComment.username = pairUser.username;
                          let pairProfile = pairUser["profile"];
                          if (pairProfile){
                              lastPairComment.avatar = pairUser.image;
                          }
                      }
                      tmpCommentObject.last_pair_comment = lastPairComment;
                  }
              }
              listComments.push(tmpCommentObject);
          }
       }
  }
  let tmpCountComment = 0;
  if (countComment && (typeof countComment == "number")){
    tmpCountComment = countComment;
  }
  let tmpUserName = "";
  if (lastUserName){
    tmpUserName = lastUserName;
  }
  let postDetail = {
    "id": id,
    "is_api_success": false,
    "title": "",
    "is_seen": true,
    "count_comment": tmpCountComment,
    "last_user": {
        "avatar": avatar,
        "username": tmpUserName,
        "create_at": updateAt
    },
    "comments": listComments
  }
  savePostDetail(postDetail, isCheckNewComment);
}

/**
* Save Post Detail
* Case 1: Add link (isCheckNewComment = false or null)
* Case 2: Add or Update When Get Comment From API (isCheckNewComment = true)
*/
function savePostDetail(postDetail, isCheckNewComment){
  getListLinkUrlFromStorage(function(listLinkUrl){
    if (listLinkUrl.length > 0){
      let currentPostId = postDetail.id;
      let i;
      let indexExits = null;
      for (i = 0; i < listLinkUrl.length; i++) {
          let postId = listLinkUrl[i].id;
          if (postId == currentPostId){
             indexExits = i;
             break;
          }
      }
      if ((typeof indexExits == "number") && indexExits >= 0){
        // Update And Check Notification
        let oldPostDetail = listLinkUrl[indexExits];
        if (isCheckNewComment == true && oldPostDetail.is_api_success == true){
          let latestNewListComments = postDetail.comments;
          if (latestNewListComments && latestNewListComments.length > 0){
              processingForPushNotification(postDetail, latestNewListComments, oldPostDetail);
          } else {
              postDetail.is_seen = oldPostDetail.is_seen;
          }
        }
        if (isCheckNewComment == null){
          postDetail.count_comment = oldPostDetail.count_comment;
          postDetail.is_seen = oldPostDetail.is_seen;
          postDetail.avatar = oldPostDetail.avatar;
          postDetail.comments = oldPostDetail.comments;
        }
        postDetail.is_api_success = true;
        postDetail.title = oldPostDetail.title;
        listLinkUrl[indexExits] = postDetail;
      } else {
        // ADD New POST DETAIL
        listLinkUrl.push(postDetail);
      }
    } else {
      // ADD New POST DETAIL
      listLinkUrl.push(postDetail);
    }
    chrome.storage.local.set({ listLinkUrl: listLinkUrl },
        function() {
            if (isCheckNewComment == null){
                callAPIGetPostDetailByPostId(postDetail.id, function(data){
                    saveMoreInformationPostDetail(data);
                });
            }
        }
    );
  })
}


/**
 * Push new notification
 */
function pushNewNotification(postDetail, title, isPair, newCommentInfo) {
    postDetail.is_seen = false;
    allowDisplayNotification(function(isTurnOnOffNotification){
        if (isTurnOnOffNotification){
            let username = postDetail.last_user.username;
            let avatar = postDetail.last_user.avatar;
            if (isPair == null){
                notify("Mazii: " + title, "[" + username + "] just commented on the post.\nClick here to view the post details.", avatar, function(id){
                    let notificationInfo = {
                        "id": id,
                        "post_id": postDetail.id
                    }
                    listIdNotification.push(notificationInfo);
                });
            } else {
                // PAIR
                let parentName = newCommentInfo.username;
                let childName = newCommentInfo.last_pair_comment.username;
                let childNameAvatar = newCommentInfo.last_pair_comment.avatar;
                notify("Mazii: " + title, "[" + childName + "] replied to comment of [" + parentName + "].\nClick here to view the post details.", childNameAvatar, function(id){
                    let notificationInfo = {
                        "id": id,
                        "post_id": postDetail.id
                    }
                    listIdNotification.push(notificationInfo);
                });
            }
        }
    })
}

/**
 * Processing Push new notification
 */
function processingForPushNotification(postDetail, latestNewListComments, oldPostDetail) {
    if (latestNewListComments && latestNewListComments.length > 0){
        let latestOldListComments = oldPostDetail.comments;
        // CASE 1: Check latest comment (NEW COMMENT)
        if (latestOldListComments && latestOldListComments.length > 0){
            let latestNewCommentInfo = latestNewListComments[latestNewListComments.length - 1];
            let latestOldCommentInfo = latestOldListComments[latestOldListComments.length - 1];
            if (latestNewCommentInfo.id != latestOldCommentInfo.id){
                // PUSH =>>> NEW
                pushNewNotification(postDetail, oldPostDetail.title);
            } else {
                postDetail.is_seen = oldPostDetail.is_seen;
            }
        } else {
            // PUSH =>>> NEW
            pushNewNotification(postDetail, oldPostDetail.title);
        }
        // CASE 2: Check latest pair comments (PAIR COMMENT)
        if (latestOldListComments && latestOldListComments.length > 0){
            let i;
            for (i = 0; i < latestNewListComments.length; i++){
                let newCommentInfo =  latestNewListComments[i];
                let j;
                for (j = 0; j<latestOldListComments.length; j++){
                    let oldCommentInfo =  latestOldListComments[j];
                    if (newCommentInfo && oldCommentInfo &&  newCommentInfo.id == oldCommentInfo.id){
                        // Same as comment && check pair
                        if (newCommentInfo.last_pair_comment){
                            if (oldCommentInfo.last_pair_comment == null || newCommentInfo.last_pair_comment.id != oldCommentInfo.last_pair_comment.id){
                                // PUSH =>> NEW
                                pushNewNotification(postDetail, oldPostDetail.title, true, newCommentInfo);
                            }
                        }
                    }
                }
            }
        }
    }
}

/**
* Save more Information
* Example: Title
*/
function saveMoreInformationPostDetail(data){
  let jsonData = JSON.parse(data);
  if (jsonData){
     let id = jsonData["id"];
     let title = jsonData["title"];
     let i;
     getListLinkUrlFromStorage(function(listLinkUrl){
        if (listLinkUrl.length > 0){
             for (i = 0; i < listLinkUrl.length; i++) {
               let postId = listLinkUrl[i].id;
               if (postId == id){
                 listLinkUrl[i].title = title;
                 break;
               }
             }
             chrome.storage.local.set({listLinkUrl: listLinkUrl},
                 function () {
                     notify(notify_title, "Following this post Id: " + id + "\n" + title);
                 }
             );
         }
    })
  }
}

/**
* Start Automation Program
*/
function startAutomation() {
  timer = setInterval(onTimerElapsed, timerInterval);
}

/**
* Stop Automation Program
*/
function stopAutomation() {
  clearInterval(timer);
}

/**
* Message Listener Button Start Or Stop Clicked
*/
function startOrStopClicked(){
    chrome.storage.local.get(null, function(data) {
        var error = chrome.runtime.lastError;
        if (error){
            return;
        }
        let isStarted = data.is_started;
        if (isStarted == null || isStarted == false){
            isStarted = true;
            startAutomation();
        } else {
            isStarted = false;
            stopAutomation();
        }
        chrome.storage.local.set({ is_started: isStarted });
    });
}
