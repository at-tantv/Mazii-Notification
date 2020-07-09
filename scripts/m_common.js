// Copyright (c) 2020 HTT Dev Inc. All rights reserved.
/**
 * Author: at-tantv
 * Create at: 2020/07/07
 * Version: 1.0.1
 * Descriptions: Define function or constant use for program
 */

let notify_title = "Mazii - Notification";

/**
* Get List Link URL from storage
*/
function getListLinkUrlFromStorage(callback){
  chrome.storage.local.get(null, function(data) {
    var error = chrome.runtime.lastError;
    if (error){
        return;
    }
    let listLinkUrl = [];
    if (data.listLinkUrl){
       listLinkUrl = data.listLinkUrl;
    }
    callback(listLinkUrl);
  })
}

/**
* Get PostId by Link URL
*/
function getPostIdByLinkUrl(linkUrl){
  // Validate URL link
  let isUrlLinkValidate = linkUrl.includes("/qa?detail=");
  if (isUrlLinkValidate){
    // Replace all leading non-digits with nothing
    let postId = linkUrl.replace(/\D/g,'');
    if (isNumber(postId)){
       return postId;
    }
  }
  return null;
}

/**
* Check User Allow Display Notification
*/
function allowDisplayNotification(callback){
  chrome.storage.local.get(null, function(data) {
    var error = chrome.runtime.lastError;
    if (error){
        return;
    }
    callback(data.is_display_notification);
  })
}

/**
* Check Variale is Number
*/
function isNumber(n) { return /^-?[\d.]+(?:e-?\d+)?$/.test(n); }
