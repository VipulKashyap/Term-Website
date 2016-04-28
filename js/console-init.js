// var MYTERMINAL = MYTERMINAL || {};
//
// MYTERMINAL.util = {};

var myConsole;

window.onload = function() {
  myConsole = new Console({
      userId: "guest",
      fileDB: fileDB,
      consoleDiv: "old-console-io",
      inputDiv: "curr-input-line",
      inputStarterDiv: "input-starter",
      modalDiv: "modal-view",
      modalDataDiv: "modal-html"
  });

  myConsole.typeAndRunCmd("cat about_me.txt");

  myConsole.linkCommandToEvent("about-me-link", "click", "cat about_me.txt");
  myConsole.linkCommandToEvent("projects-link", "click", "cd Projects | ls");
  myConsole.linkCommandToEvent("resume-link", "click", "pdfview resume.pdf");
  myConsole.linkCommandToEvent("github-link", "click", "go github");
  myConsole.linkCommandToEvent("linkedin-link", "click", "go linkedin");
};

window.onerror = function() {
  myConsole.print("Looks like something went wrong...");
  myConsole.setInputEnabled(true);
};
