// var MYTERMINAL = MYTERMINAL || {};
//
// MYTERMINAL.util = {};

var myConsole;

window.onload = function() {
  myConsole = new Console({
      userId: "guest",
      fileDir: "https://api.github.com/repos/VipulKashyap/Term-Website/contents/",
      consoleDiv: "old-console-io",
      inputDiv: "curr-input-line",
      inputStarterDiv: "input-starter"
  });

  myConsole.typeAndRunCmd("cat about_me.txt");

  myConsole.linkCommandToEvent("about-me-link", "click", "cat about_me.txt");
  myConsole.linkCommandToEvent("projects-link", "click", "cd Projects | ls");
  myConsole.linkCommandToEvent("resume-link", "click", "cat resume.pdf");
  myConsole.linkCommandToEvent("github-link", "click", "go github");
  myConsole.linkCommandToEvent("linkedin-link", "click", "go linkedin");
};

window.onerror = function() {
  myConsole.print("Looks like something went wrong...");
  myConsole.setInputEnabled(true);
};
