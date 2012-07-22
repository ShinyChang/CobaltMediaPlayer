var musicTitle = "";
var timeBar = document.getElementById("TimeBar");			
var playState = chrome.extension.getBackgroundPage().getPlayState();
var random;
var repeat;
var muteState = chrome.extension.getBackgroundPage().getMuteState();
var soundIMG = document.getElementById("sound");
var playlistState =  chrome.extension.getBackgroundPage().getPlaylistState();
var searchState = chrome.extension.getBackgroundPage().getSearchState();
var startIndex = 1;
var jsonObject;
var listArray =  chrome.extension.getBackgroundPage().getPlaylist();

soundIMG.src = (muteState == true) ? "img/sound2.png" : "img/sound.png";
document.getElementById("playText").innerHTML = (playState != "PLAYING") ? "►" : "■";
document.getElementById("Volume").value = chrome.extension.getBackgroundPage().getVolume();

//random init
random = chrome.extension.getBackgroundPage().getRandom();
if(random) {
	document.getElementById("randomLbl").className = "random_onSelected";
} else {
	document.getElementById("randomLbl").className = "random";
}

//repeat init
repeat = chrome.extension.getBackgroundPage().getLoopState();
if (repeat) {
	document.getElementById("repeatLbl").className = "repeat_onSelected";
} else {
	document.getElementById("repeatLbl").className = "repeat";
}

//show / hide playlist init
if(playlistState) {
	document.getElementById("playlistPlaceHolder").style.display = "none";
	document.getElementById("listIcon").src = "img/list.png";
} else {
	document.getElementById("playlistPlaceHolder").style.display = "block";
	document.getElementById("listIcon").src = "img/list2.png";
}

//show / hide search init
if(searchState) {
	document.getElementById("searchPlaceHolder").style.display = "none";
	document.getElementById("searchIcon").src = "img/search2.gif";
} else {
	document.getElementById("searchPlaceHolder").style.display = "block";
	document.getElementById("searchIcon").src = "img/search.gif";
}	