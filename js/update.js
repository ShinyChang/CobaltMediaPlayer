function updateInfo() {
	updateTineBar();
	updateTitle();
	updatePlaylist();
}

function updateTineBar() {
	timeBar.max = chrome.extension.getBackgroundPage().getDuration();
	timeBar.value = chrome.extension.getBackgroundPage().getPosition();
	if(timeBar.max > 0) {
		document.getElementById("time").innerHTML = 
			Math.floor(timeBar.value/60) + ":" + Math.floor(timeBar.value % 60) + "/" + 
			Math.floor(timeBar.max / 60) + ":" + Math.floor(timeBar.max % 60);
	}
}

function updateTitle() {
	var nowTitle = chrome.extension.getBackgroundPage().getPlaylistTitle();
	if (musicTitle != nowTitle)
	{
		document.getElementById("musicTitle").innerHTML = "<B>" + 
			nowTitle + "</B>";
		musicTitle = nowTitle;
	}
	var errorState = chrome.extension.getBackgroundPage().getErrorState();
	document.getElementById("errorMessage").innerHTML = (errorState == true) ? "An error occurred." : "";
}
setInterval("updateInfo()", 1000);	//update timer (every 1 sec)

function updatePlaylist() {
	var playlistHolder = document.getElementById("playlistPlaceHolder");
	playlistHolder.innerHTML = "";
	var playlist = chrome.extension.getBackgroundPage().getPlaylist();
	var newUL = document.createElement("ol");
	newUL.className = "ul";
	for(var i = 0; i < playlist.length; i++) {
		var newLI = document.createElement("li");
		newLI.className = "l0";
		var delImage = document.createElement("img");
		delImage.id= "del" + i;
		delImage.src = "img/delete.png";
		delImage.title = "delete";
		delImage.onclick = function() { removeSong(this); };
		
		var titleSpan = document.createElement("span");
		titleSpan.id = i;
		titleSpan.innerHTML = playlist[i].title;
		titleSpan.onclick = function() { playlistItem(this); };

		newLI.appendChild(delImage);
		newLI.appendChild(titleSpan);
		newUL.appendChild(newLI);
	}
	playlistHolder.appendChild(newUL);
}

function changeListState() {
	playlistState = !playlistState;
	chrome.extension.getBackgroundPage().setPlaylistState(playlistState);
	if(playlistState) {
		document.getElementById("playlistPlaceHolder").style.display = "none";
		document.getElementById("listIcon").src = "img/list.png";
	} else {
		document.getElementById("playlistPlaceHolder").style.display = "block";
		document.getElementById("listIcon").src = "img/list2.png";
	}
}

function changeSearchState() {
	searchState = !searchState;
	chrome.extension.getBackgroundPage().setSearchState(searchState);
	if(searchState) {
		document.getElementById("searchPlaceHolder").style.display = "none";
		document.getElementById("searchIcon").src = "img/search2.gif";
	} else {
		document.getElementById("searchPlaceHolder").style.display = "block";
		document.getElementById("searchIcon").src = "img/search.gif";
	}			
}

