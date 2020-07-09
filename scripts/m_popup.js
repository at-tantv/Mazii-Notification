// Copyright (c) 2020 HTT Dev Inc. All rights reserved.
/**
 * Author: at-tantv
 * Create at: 2020/07/07
 * Version: 1.0.1
 * Descriptions: Popup Html Processing
 */

/**
* Get Element use Javascript
*/
let btnStartOrStop = document.getElementById('start-or-stop-button');
let lblStatus = document.getElementById('status-label');
let divListLinkUrl = document.getElementById('div-list-post-id');
let btnRemove =  document.getElementById('btn_remove');
let btnTurnOnOffNotification = document.getElementById('btn-turn-on-off-notification');
/***************************************************************************/
/*BEGIN*/
displayCurrentStatusProgram();
registerEventPopup();
registerEventRemovedPost();
showListPostFollowed();
/*END*/
/***************************************************************************/

/**
* Display current status Program
*/
function displayCurrentStatusProgram(){
  chrome.storage.local.get(null, function(data) {
      var error = chrome.runtime.lastError;
      if (error){
          return;
      }
      let isStarted = data.is_started;
      if (isStarted == null || isStarted == false){
          lblStatus.innerHTML = "You has stopped receiving mazii notification.";
          btnStartOrStop.textContent = "START";
      } else {
          lblStatus.innerHTML = "The application is already running.";
          btnStartOrStop.textContent = "STOP";
      }

      allowDisplayNotification(function(isTurnOnOffNotification){
        if (isTurnOnOffNotification){
           // Display Notification
           btnTurnOnOffNotification.textContent = "Disable notification display";
        } else {
           // Hide Notification
           btnTurnOnOffNotification.textContent = "Allow notification display";
        }
      })
  });
}

/**
* Register Event Click
*/
function registerEventPopup() {
    btnStartOrStop.onclick = function(element) {
        chrome.storage.local.get(null, function(data) {
            var error = chrome.runtime.lastError;
            if (error){
                return;
            }
            let isStarted = data.is_started;
            if (isStarted == null || isStarted == false){
                lblStatus.innerHTML = "The application is already running.";
                btnStartOrStop.textContent = "STOP";
            } else {
                lblStatus.innerHTML = "You has stopped receiving mazii notification.";
                btnStartOrStop.textContent = "START";
            }
            chrome.runtime.sendMessage({action: "start_or_stop"}, function(response) {});
        });
    }

    btnTurnOnOffNotification.onclick = function(element) {
      allowDisplayNotification(function(isTurnOnOffNotification){
        let userSetting = !isTurnOnOffNotification;
        if (userSetting){
           // Display Notification
           btnTurnOnOffNotification.textContent = "Disable notification display";
           notify(notify_title, "You will receive both messsage and push notification.");
        } else {
           // Hide Notification
           btnTurnOnOffNotification.textContent = "Allow notification display";
           notify(notify_title, "You will only see notifications from the list notifications.");
        }
        chrome.storage.local.set({ is_display_notification: userSetting });
      })
    }
}

/**
* Show list post Followed
*/
function showListPostFollowed(){
  getListLinkUrlFromStorage(function(listLinkUrl){
      divListLinkUrl.innerHTML = "";
      if (listLinkUrl.length > 0){
        btnRemove.hidden = false;
        let i;
        for (i = 0; i < listLinkUrl.length; i++) {
            let postId = listLinkUrl[i].id;
            let title = listLinkUrl[i].title;
            let createAt = listLinkUrl[i].last_user.create_at;
            let isSeen = listLinkUrl[i].is_seen;
            if (createAt == null){
                createAt = "";
            }
            let notSeenHtml =
                "<div id=\""+"div_"+postId+"\" class=\"body_info_not_seen margin_info\">" +
                "<input id=\""+"checkbox_"+postId+"\" type=\"checkbox\">" +
                " <label id=\""+"lb_title_"+postId+"\">" + postId + " (last comment: " + createAt + ") :" + title + "</br></br>" +
                "<label id=\""+"lb_seen_"+postId+"\" style=\"font-weight: bold;font-size: 15px; color: red;\">NOT seen</label>" +
                "<input type=\"button\" value=\"More\" class=\"button_more\" id=\"btn_more_"+postId+"\">" +
                "</div>" +
                "<hr style=\"width:100%;text-align:left;\">";

            let seenHtml =
                "<div id=\""+"div_"+postId+"\" class=\"body_info_seen margin_info\">" +
                "<input id=\""+"checkbox_"+postId+"\" type=\"checkbox\">" +
                " <label id=\""+"lb_title_"+postId+"\">" + postId + " (last comment: " + createAt + ") :" + title + "</br></br>" +
                "<label id=\""+"lb_seen_"+postId+"\" style=\"font-weight: bold;font-size: 15px; color: red;\">Seen</label>" +
                "<input type=\"button\" value=\"More\" class=\"button_more\" id=\"btn_more_"+postId+"\">" +
                "</div>" +
                "<hr style=\"width:100%;text-align:left;\">";

            if (isSeen == true){
                divListLinkUrl.innerHTML += seenHtml;
            } else {
                divListLinkUrl.innerHTML += notSeenHtml;
            }
            /*
            <div id="3" class="body_info margin_info">
                    <label class="container" id="1">232332<input type="checkbox" checked="checked"><span class="checkmark"></span></label>
                    <label id="2" style="font-weight: bold;font-size: 10px;">is readed</label>
                    <input type="button" value="More" class="button_more" id="43"></input>
                </div>
                <hr style="width:100%;text-align:left;">
             */

        }

        // Add listener
        for (i = 0; i < listLinkUrl.length; i++) {
            let postId = listLinkUrl[i].id;
            document.getElementById("btn_more_" + postId).addEventListener("click", function() {
                notificationClicked(postId);
            })
        }
      } else {
          notify(notify_title, "You're not following post yet.\nPlease select one of the post url !")
      }
  });


}

/**
* Register Event Remove PostId
*/
function registerEventRemovedPost() {
    btnRemove.onclick = function(element) {
      getListLinkUrlFromStorage(function(listLinkUrl){
            if (listLinkUrl.length > 0) {
                let i;
                let isRemoved = false;
                for (i = 0; i < listLinkUrl.length; i++) {
                    let postId = listLinkUrl[i].id;
                    let checkBox = document.getElementById("checkbox_" + postId);
                    let isCheck = checkBox.checked;
                    if (isCheck == true){
                        listLinkUrl.splice(i, 1);
                        isRemoved = true;
                    }
                }
                if (isRemoved == true){
                    chrome.storage.local.set({ listLinkUrl: listLinkUrl },
                        function() {
                            showListPostFollowed();
                        }
                    );
                } else {
                    notify(notify_title, "Select one or more post id.")
                }
            }
        })
    };
}
