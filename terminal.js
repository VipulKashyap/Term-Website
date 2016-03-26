var userID = 'guest';
var currDir = '';
var oldConsole, consoleInputLine, inputStarterDiv;
var diskData = [];
var currDirData;
var lineStarter = "";

function getLineStarter()
{
  return userID + '@vip:/web' + currDir + '>  ';
}

function printToConsole(data)
{
  oldConsole.appendChild(document.createElement('br'));
  oldConsole.appendChild(document.createTextNode(data));
}

function getFile(name)
{
  for(i in currDirData)
  {
    if(currDirData[i].name == name && currDirData[i].type == "file")
      return currDirData[i];
  }
  return undefined;
}

function getDirectory(name)
{
  for(i in currDirData)
  {
    if(currDirData[i].name == name && currDirData[i].type == "dir")
      return currDirData[i];
  }
  return undefined;
}

function submitCommandInput()
{
  printToConsole(lineStarter + consoleInputLine.innerHTML);
  var cmd = consoleInputLine.textContent.replace(/\s\s+/g, ' ').trim();
  consoleInputLine.innerHTML = "";
  consoleInputLine.scrollIntoView();
  runCommand(cmd);
  consoleInputLine.scrollIntoView();
}

var consoleInputHandler = function (e) {
  var key = e.which || e.keyCode || 0;
  if(key == 13)
  {
    submitCommandInput();
    return false;
  }
  return true;
}

function initGlobalVars()
{
  consoleInputLine = document.getElementById("curr-input-line");
  oldConsole = document.getElementById("old-console-io");
  inputStarterDiv = document.getElementById("input-starter");
  lineStarter = getLineStarter();
  $.ajax({
      type: "GET",
      url: "https://api.github.com/repos/VipulKashyap/Term-Website/contents/",
      dataType: "json",
      success: function(result) {
        currDirData = result;
      },
      error: function() {
        printToConsole("Failed to get file list from server.");
      }
  });
}

function screenSetup(){
  inputStarterDiv.innerHTML = lineStarter;
  consoleInputLine.focus();
}

$(function() {

  initGlobalVars();

  screenSetup();

  // http://stackoverflow.com/questions/1125292/how-to-move-cursor-to-end-of-contenteditable-entity
  $("html").click( function(event) {
    consoleInputLine.focus();
    var range = document.createRange();
    range.selectNodeContents(consoleInputLine);
    range.collapse(false);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
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
var cmdTypeAndRunTimer;
function typeAndRunCmdHelper(str) {
    var humanize = Math.round(Math.random() * (85 - 30)) + 30;

    cmdTypeAndRunTimer = setTimeout(function() {
        char++;
        consoleInputLine.innerHTML = str.substring(0, char) + '|';
        typeAndRunCmdHelper(str);

        if (char == str.length) {
            consoleInputLine.innerHTML = consoleInputLine.innerHTML.slice(0, -1);
            clearTimeout(cmdTypeAndRunTimer);
            consoleInputLine.focus();
            submitCommandInput();
        }

    }, humanize);
}

function typeAndRunCmd(str) {
  char = 0;
  clearTimeout(cmdTypeAndRunTimer);
  typeAndRunCmdHelper(str);
  consoleInputLine.scrollIntoView();
}

var result;
function getFileContent(path, callback) {
  $.get( path , function( data ) {
    result = data;
  })
  .fail(function() {
    result = "File retrieval failed!";
  })
  .done(
    callback
  );
}

function runCommand(str) {
  if(/^\s*$/.test(str))
    return -2;

  var cmds = str.split(" ");

  consoleInputEnabled(false);

  switch (cmds[0]) {
    case "clear":
      return cmd_clear(cmds);
    case "cat":
      return cmd_cat(cmds);
    case "ls":
      return cmd_ls(cmds);
    case "cd":
      return cmd_cd(cmds);
    default:
      printToConsole(cmds[0] + ": command not found");
  }

  consoleInputEnabled(true);
  return 0;
}

function consoleInputEnabled(state)
{
  if(state)
  {
    consoleInputLine.setAttribute("contenteditable", "true");
    consoleInputLine.style.display = 'inline-block';
    inputStarterDiv.style.display = 'inline-block';
    consoleInputLine.scrollIntoView();
  }else{
    consoleInputLine.setAttribute("contenteditable", "false");
    consoleInputLine.style.display = 'none';
    inputStarterDiv.style.display = 'none';
  }
}
