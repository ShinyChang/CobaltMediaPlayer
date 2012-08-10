
//init
var loopState = false;
var playState = null;
var muteState = false;
var random = false;
var isError = false;
var volume = 100;
var listLength = 0;
var playlistItemTitle = "undefined";
var oldValue = 0;
var playlistState = true;
var searchState = true;

//error
function onError() {
	isError = true;
}

//check for playNext
function playNextCheck() {
	if(loopState == true) {
		jwplayer("container").play();
	} else {
		playlistNext();
	}
}

//play or pause
function start() {
	jwplayer("container").play();
}

//load a url
function load(url) {
	jwplayer("container").load(url);
}

//load YouTube video by id
function loadVideoById(id) {
	jwplayer("container").load("http://www.youtube.com/v/" + id);
}

//load YouTube playlist by id
function loadPlaylistById(id) {
	jwplayer("container").load("http://gdata.youtube.com/feeds/api/playlists/" + id + "?max-results=50");
}

//load by js array
function loadPlaylistByJsArray(playlist) {
	jwplayer("container").load(playlist);
}

function setLoopState(state) {
	loopState = state;
}

//play next video
function playlistNext() {
	if(random) {
		jwplayer("container").playlistItem(Math.floor(Math.random() * listLength));
	} else {
		jwplayer("container").playlistNext();
	}
}

//play prev video
function playlistPrev() {
	if(random) {
		jwplayer("container").playlistItem(Math.floor(Math.random() * listLength));
	} else {
		jwplayer("container").playlistPrev();
	}
}

//search
function search(value) {
	var spaceIdx = value.indexOf(" ");
	if(spaceIdx != -1) {
		value = value.replace(" ", "+");
	}
	jwplayer("container").load("http://gdata.youtube.com/feeds/api/videos?max-results=50&format=5&q=" + value);
}

function setVolume(value) {
	jwplayer("container").setVolume(value);
	volume = value;
}

function setMute(value) {
	jwplayer("container").setMute(value);
	muteState = value;
}

function setPlaylistState(value) {
	playlistState = value;
}

function getPlaylistState() {
	return playlistState;
}

function setSearchState(value) {
	searchState = value;
}

function getSearchState() {
	return searchState;
}

//seek video
function setTime(value) {
	jwplayer("container").seek(value);
}

function playlistItem(value) {
	jwplayer("container").playlistItem(value);
}

function setRandom(value) {
	random = value;
}

function getRandom() {
	return random;
}

function getTime() {
	return time;
}

function getDuration() {
	return jwplayer("container").getDuration();
}

function getErrorState() {
	return isError;
}

function getPosition() {
	return jwplayer("container").getPosition();
}

function getLoopState() {
	return loopState;
}

function getVolume() {
	return volume;
}

function getMuteState() {
	return muteState;
}

function getPlaylist() {
	return jwplayer("container").getPlaylist();
}

function getPlayState() {
	return jwplayer("container").getState();
}

function getPlaylistItem() {
	return jwplayer("container").getPlaylistItem();
}

function getPlaylistTitle() {
	return playlistItemTitle;
}

function updatePlaylist() {
	listLength = getPlaylist().length;
}

function updatePlaylistItem() {
	playlistItemTitle = getPlaylistItem().title;
	isError = false;
}

//update chrome extension badge text
function updateBadge() {
	var now = getPosition();
	var total = getDuration();
	if(isError) {
		chrome.browserAction.setBadgeText({text: "Err"});
	} else if(total > now) {
		now = Math.floor(now);
		total = Math.floor(total);
		var remaining = total - now;
		remaining = Math.floor(remaining / 60) + ":" + (remaining % 60);
		chrome.browserAction.setBadgeText({text: remaining.toString()});
	} else if(playState == "BUFFERING"){
		chrome.browserAction.setBadgeText({text: "Buff"});
	} else {
		chrome.browserAction.setBadgeText({text: "Idle"});
	}
}
setInterval(updateBadge, 1000);