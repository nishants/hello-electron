var {ipcRenderer, remote} = require('electron');
ipcRenderer.send('get-downloader', 1);
ipcRenderer.on('data-received', (event, arg) => {
  updateProgress(arg.received/arg.total);
});

const modal       = "<div class='downloader-modal'></div>";
const progressBar = "<div class='downloader-progress-bar'><label>Updating</label><div class='downloader-progress-status'></div></div>"

const statusHeight = 3;
const statusColor = "#8db352";
const statusBgColor = "rgba(141, 179, 82, 0.3)";

function updateProgress(fraction){
  console.log(fraction)
  $(".downloader-progress-status").css("transform", "scaleX(<status>)".replace("<status>", fraction));
}

function render(){
  $("body").prepend(modal);
  $(".downloader-modal").first().prepend(progressBar);

  setTimeout(function(){
    $(".downloader-progress-status").css("height", "<status-height>px".replace("<status-height>", statusHeight));
    $(".downloader-progress-status").css("transform", "scaleX(0)");
    $(".downloader-progress-status").css("transform-origin", "0 0");
    $(".downloader-progress-status").css("transform-origin", "0 0");
    $(".downloader-progress-status").css("background", statusColor);
    $(".downloader-progress-status").css("width", "100%");

    $(".downloader-progress-bar").css("text-align", "left");
    $(".downloader-progress-bar").css("background", statusBgColor);
    $(".downloader-progress-bar").css("width", "100%");
    $(".downloader-progress-bar label").css("position", "absolute");
    $(".downloader-progress-bar label").css("padding", "5px");
    $(".downloader-progress-bar label").css("font-size", "10px");
    $(".downloader-progress-bar label").css("display", "block");

  })

}

$(document).ready(render)
