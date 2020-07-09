// Copyright (c) 2020 HTT Dev Inc. All rights reserved.
/**
 * Author: at-tantv
 * Create at: 2020/07/07
 * Version: 1.0.1
 * Descriptions: Working with API
 */

/**
* Call API get More Information by PostId
*/
function callAPIGetPostDetailByPostId(postId, callback){
  let xmlhttp = new XMLHttpRequest();
  let url = "https://api.mazii.net/api/social/post-with-id";
  xmlhttp.open("POST", url, true);
  xmlhttp.setRequestHeader("Content-type", "application/json");
  xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        callback(xmlhttp.responseText);
      }
  }
  let parameters = {
      "id": postId,
      "token": ""
  };
  xmlhttp.send(JSON.stringify(parameters));
}

/**
* Request From API : Get comments of post by postId
*/
function callAPIgetCommentsByPostId(postId, callback){
  let xmlhttp = new XMLHttpRequest();
  let url = "https://api.mazii.net/api/social/comment-for-post";
  xmlhttp.open("POST", url, true);
  xmlhttp.setRequestHeader("Content-type", "application/json");
  xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        callback(xmlhttp.responseText);
      }
  }
  let parameters = {
      "id": postId,
      "token": ""
  };
  xmlhttp.send(JSON.stringify(parameters));
}
