// Copyright (c) 2020 HTT Dev Inc. All rights reserved.
/**
 * Author: at-tantv
 * Create at: 2020/07/07
 * Version: 1.0.1
 * Descriptions: Working with notitication class
 */

/**
* Check permission of notification
*/
function checkPermissionNotification(callback) {
    if (chrome.notifications.getPermissionLevel) {
        chrome.notifications.getPermissionLevel(function (permissionLevel) {
            if (permissionLevel === 'granted') {
                callback(true);
            } else {
                callback(false);
            }
        });
    } else {
        callback(true);
    }
}

/**
* Display notification to chrome
*/
function notify(title, message, iconUrl, callback) {
    if (checkPermissionNotification(function(isAllowed){
        if (isAllowed == false){
            alert("Please enable permission notification in chrome.")
        } else {
            let tmpTitle = "No Title";
            if (title && (typeof title == "string")){
                tmpTitle = title;
            }
            let tmpMessage = "No Message";
            if (message && (typeof message == "string")){
                tmpMessage = message;
            }

            let tmpIconUrl = "../images/icon.png";
            if (iconUrl != null && iconUrl.length > 5){
                tmpIconUrl = iconUrl;
            }
            let options ={
                type: "basic",
                title: tmpTitle,
                message: tmpMessage,
                iconUrl: tmpIconUrl,
            }
            return chrome.notifications.create("", options, callback);
        }
    }));
}

/**
* Register Event click of notification
*/
function registerEventNotificationClicked(){
  chrome.notifications.onClicked.addListener(function(id) {
      if (listIdNotification.length > 0){
         let i = 0;
         for (i = 0; i < listIdNotification.length; i++) {
             let notificationInfo = listIdNotification[i];
             if (notificationInfo.id == id){
                notificationClicked(notificationInfo.post_id);
                listIdNotification.splice(i, 1);
                break;
             }
         }
      }
  })
}

/**
* processing when click on notitication item
*/
function notificationClicked(id) {
  let postDetailUrl = "https://mazii.net/qa?detail="+ id +"&hl=vi-VN";
  chrome.storage.local.get(null, function(data) {
        var error = chrome.runtime.lastError;
        if (error){
            return;
        }
        let listLinkUrl = [];
        if (data.listLinkUrl) {
            listLinkUrl = data.listLinkUrl;
        }
        if (listLinkUrl.length > 0) {
            let currentPostId = id;
            let i;
            let indexExits = null;
            for (i = 0; i < listLinkUrl.length; i++) {
                let postId = listLinkUrl[i].id;
                if (postId == currentPostId) {
                    indexExits = i;
                    break;
                }
            }
            if ((typeof indexExits == "number") && indexExits >= 0) {
                // Update And Check Notification
                let oldPostDetail = listLinkUrl[indexExits];
                oldPostDetail.is_seen = true;
                listLinkUrl[indexExits] = oldPostDetail;

                chrome.storage.local.set({listLinkUrl: listLinkUrl},
                    function () {
                    }
                );

            }
        }
      window.open(postDetailUrl);
  })
}
