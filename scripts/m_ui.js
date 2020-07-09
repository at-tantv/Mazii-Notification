// Copyright (c) 2020 HTT Dev Inc. All rights reserved.
/**
 * Author: at-tantv
 * Create at: 2020/07/07
 * Version: 1.0.1
 * Descriptions: Create GUI using Javascript
 */

/**
* Create Context Menu (button follow this post)
*/
function createContextMenus(){
  chrome.contextMenus.removeAll();
  // Add parent context menus
  chrome.contextMenus.create({
    title: "Mazii - Notification Action",
    id: "parent",
    contexts:["link", "selection"]
  });
  // Add child context menu
  chrome.contextMenus.create({
    title: "Follow this post",
    parentId: "parent",
    contexts:["link", "selection"],
    onclick: function(info, tab) {
      let linkUrl = info.linkUrl;
      saveNewLinkUrl(linkUrl);
    }
  });
}
