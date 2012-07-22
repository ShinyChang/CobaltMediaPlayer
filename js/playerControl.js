function start() {
	playState = chrome.extension.getBackgroundPage().getPlayState();
	if(playState == "PLAYING") {
		document.getElementById("playText").innerHTML = "►";
	} else {
		document.getElementById("playText").innerHTML = "■";
	}
	chrome.extension.getBackgroundPage().start();
}

function smartLoad() {
	//init search result
	var resultContainer = document.getElementById("result");
	while(resultContainer.hasChildNodes()) {
		resultContainer.removeChild(resultContainer.lastChild);
	}
	var txt = document.getElementById("smartURL").value
	var len = txt.length
	if(len == 16 || len == 18) {	//playlist id
		if (len == 18) {
			txt = txt.substr(2, len - 1);
		}
		var url = "http://gdata.youtube.com/feeds/api/playlists/" + txt + "?alt=json&max-results=50";
		makeRequest(url, "S");
		document.getElementById("result").style.display = "block";
	} else if (len == 11) {	//video id
		var url = "http://gdata.youtube.com/feeds/api/videos/"+txt;
		searchYouTubeVideo(url);
	} else if (txt.indexOf("http://") >= 0) {	//otherURL
		if (txt.indexOf("youtube.com") >= 0) {	//youtube url
			alert("Sorry, not implement!");	
		} else {	//direct media
			searchDirectLink(txt);		
		}
	}

}

function setLoopState(obj) {
	repeat = !repeat;
	if (repeat) {
		document.getElementById("repeatLbl").className = "repeat_onSelected";
	} else {
		document.getElementById("repeatLbl").className = "repeat";
	}
	chrome.extension.getBackgroundPage().setLoopState(repeat);
}

function setTime(obj) {
	chrome.extension.getBackgroundPage().setTime(obj.value);
}

function setMute() {
	if(muteState == true) {
		soundIMG.src="img/sound.png";
	} else {
		soundIMG.src="img/sound2.png";
	}
	muteState = !muteState;
	chrome.extension.getBackgroundPage().setMute(muteState);
}

function setRandom() {
	random = !random;
	if(random) {
		document.getElementById("randomLbl").className = "random_onSelected";
	} else {
		document.getElementById("randomLbl").className = "random";
	}
	chrome.extension.getBackgroundPage().setRandom(random);
}

function playlistNext() {
	chrome.extension.getBackgroundPage().playlistNext();
}

function playlistPrev() {
	chrome.extension.getBackgroundPage().playlistPrev();
}

function playlistItem(obj) {
	chrome.extension.getBackgroundPage().playlistItem(obj.id);
}

function setVolume(obj) {
	chrome.extension.getBackgroundPage().setVolume(obj.value);
}

function getVolume() {
	chrome.extension.getBackgroundPage().getVolume();
}

function newList() {
	listArray.push({duration:"274", file:"http://www.youtube.com/watch?v=i9ivGvmJBfI&feature=youtube_gdata", image:"http://i.ytimg.com/vi/i9ivGvmJBfI/0.jpg", title:"Fish Leong-XiaoShouLaDaShou"});
	listArray.splice(0, listArray.length - 1);
	localStorage["playlist"] = JSON.stringify(listArray);
	chrome.extension.getBackgroundPage().loadPlaylistByJsArray(listArray);	
}


