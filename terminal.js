var userID = 'guest@vip:/web>  ';

// jQuery plugin logic adapted from:
// http://stackoverflow.com/questions/1125292/how-to-move-cursor-to-end-of-contenteditable-entity
(function($){
    $.fn.focusToEnd = function() {
      this.focus();
      var range = document.createRange();
      range.selectNodeContents(this.get(0));
      range.collapse(false);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    };
})(jQuery);

function screenSetup(){
  $("#user-id").html(userID);
  $("#curr-input-line").focus();
}

var consoleInputHandler = function (e) {
  var key = e.which || e.keyCode || 0;
  if(key == 13)
  {
    var oldConsole = document.getElementById("old-console-io");
    var inputLine = document.getElementById("curr-input-line");
    oldConsole.innerHTML = oldConsole.innerHTML + "<br>" + userID + inputLine.innerHTML;
    var cmd = inputLine.textContent.replace(/\s\s+/g, ' ').trim();
    inputLine.innerHTML = "";
    document.body.scrollTop = document.body.scrollHeight;
    runCommand(cmd);
    document.body.scrollTop = document.body.scrollHeight;
    return false;
  }
  return true;
}

$(function() {
  screenSetup();

  $("html").click( function(event) {
    $("#curr-input-line").focusToEnd();
  });

  $("#curr-input-line").click(function(event){
    event.stopPropagation()
  });

  $(".link").click(function(event){
    event.stopPropagation()
  });

  $("#curr-input-line").keypress(consoleInputHandler);

});

var char = 0;
var timeOut;
function typeAndRunCmdHelper(str) {
    var humanize = Math.round(Math.random() * (85 - 30)) + 30;
    timeOut = setTimeout(function() {
        char++;
        var type = str.substring(0, char);
        $("#curr-input-line").html(type + '|');
        typeAndRunCmdHelper(str);

        if (char == str.length) {
            $("#curr-input-line").html($("#curr-input-line").html().slice(0, -1));
            clearTimeout(timeOut);
            $("#curr-input-line").focus();
            var e = jQuery.Event("keypress");
            e.which = 13;
            e.keyCode = 13;
            $("#curr-input-line").trigger(e);
        }

    }, humanize);
}

function typeAndRunCmd(str) {
  char = 0;
  clearTimeout(timeOut);
  typeAndRunCmdHelper(str);
  document.body.scrollTop = document.body.scrollHeight;
}

function getFileContent(path) {
  if(!path.startsWith("http:"))
    path = "ht"
}

function runCommand(str) {
  if(/^\s*$/.test(str))
    return false;
  var cmds = str.split(" ");
  var oldConsole = document.getElementById("old-console-io");
  var inputLine = document.getElementById("curr-input-line");
  var output = "";
  switch (cmds[0]) {
    case "cat":

      break;
    default:
      output = cmds[0] + ": command not found";
  }
  oldConsole.innerHTML = oldConsole.innerHTML + "<br>" + output;
  return true;
}
