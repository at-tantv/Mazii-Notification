// Copyright (c) 2020 HTT Dev Inc. All rights reserved.
/**
 * Author: at-tantv
 * Create at: 2020/07/07
 * Version: 1.0.1
 * Descriptions: Options Html Processing
 */

/**
* Get Element using Js
*/
let btnSave = document.getElementById('save-button');

/*
* Display interval time that user installed
*/
chrome.storage.local.get(null, function(data) {
    document.getElementById('interval-textbox').value = data.interval;
});

/**
* Button Save Clicked
*/
btnSave.onclick = function(element) {
    let intervalValue = document.getElementById('interval-textbox').value;
    chrome.storage.local.set({ interval: intervalValue },
      function() {
          notify(notify_title, "Time setting: " + intervalValue / 1000 + " seconds");
      }
    );
}
