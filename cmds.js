// clear command implementation
cmd_clear = function(cmds){
  oldConsole.innerHTML = "&nbsp;";
  consoleInputEnabled(true);
  return 0;
}

// cat command implementation
cmd_cat = function(cmds){
  // Not enough parameters
  if(cmds.length < 2)
  {
    printToConsole(cmds[0] + ": missing file path");
    consoleInputEnabled(true);
    return -1;
  }

  // Check if file exists
  var file = getFile(cmds[1]);

  if(file){
    // Get file data via ajax and print data to console
    getFileContent(file.download_url,
      function(){
          printToConsole(result);
          consoleInputEnabled(true);
      });
  } else {
    // Print out error
    printToConsole(cmds[0] + ": " + cmds[1] + ": No such file or directory");
    consoleInputEnabled(true);
    return -1;
  }

  return 0;
}

// ls command implementation
cmd_ls = function(cmds){
  /*
  var list = "";
  for(i in currDirData)
  {
    list += currDirData[i].name + '<br>';
  }
  var newNode = document.createElement('div');
  newNode.className = 'console-list';
  newNode.innerHTML = list.slice(0, list.length - 4);
  oldConsole.appendChild(newNode);
  */

  // Using columns would be ideal, but can't due to chrome bug
  var table = document.createElement('table');
  var ptr = 0;
  while(true)
  {
      var tr = document.createElement('tr');
      for(var i = 0; i < 4; i++)
      {
        if(ptr >= currDirData.length)
          break;
        var td = document.createElement('td');
        td.appendChild(document.createTextNode(currDirData[ptr].name));
        td.addEventListener("click", getCorrectCommandRunner(currDirData[ptr]), false);
        tr.appendChild(td);
        ptr++;
      }
      table.appendChild(tr);
      if(ptr >= currDirData.length)
        break;
  }
  printToConsole("");
  oldConsole.appendChild(table);
  consoleInputEnabled(true);
  return 0;
}

function getCorrectCommandRunner(file)
{
  var cmd;
  switch(file.type)
  {
    case "dir":
      cmd = "cd " + file.name;
      break;
    case "file":
      cmd = "cat " + file.name;
      break;
  }
  return function(){
    typeAndRunCmd(cmd);
  }
}

// cd implementation
cmd_cd = function(cmds){
  // Not enough parameters
  if(cmds.length < 2)
  {
    printToConsole(cmds[0] + ": missing file path");
    consoleInputEnabled(true);
    return -1;
  }

  switch(cmds[1])
  {
      case ".":
        break;
      case "..":
        if(diskData.length == 0)
          break;
        var oldData = diskData.pop();
        currDir = oldData.wd;
        currDirData = oldData.data;
        break;
      default:
        // Check if directory exists
        var file = getDirectory(cmds[1]);

        if(file){
          // Move to directory
          $.ajax({
              type: "GET",
              url: file.url,
              dataType: "json",
              success: function(result) {
                diskData.push({'wd': currDir, 'data': currDirData});
                currDir += "/" + cmds[1];
                currDirData = result;
                inputStarterDiv.innerHTML = getLineStarter();
                lineStarter = getLineStarter();
              },
              error: function() {
                printToConsole("Failed to get file list from server.");
              }
          })
          .always(function() {
            consoleInputEnabled(true);
          });
          return 0;
        } else {
          // Print out error
          printToConsole(cmds[0] + ": " + cmds[1] + ": No such directory");
          consoleInputEnabled(true);
          return -1;
        }
  }

  lineStarter = getLineStarter();
  inputStarterDiv.innerHTML = lineStarter;
  consoleInputEnabled(true);

  return 0;
}
