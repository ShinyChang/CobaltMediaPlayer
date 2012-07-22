function preSearch(obj) {
	startIndex = 1;	//init start index
	getSuggest(obj);//get suggest
	search(obj);	//search on youtube
	document.getElementById("suggestPlaceHolder").style.display = "block";
}
function search(obj) {
	var keyword = obj.value;
	if(keyword != "") {
		document.getElementById("addBtn").disabled = false;
		document.getElementById("subBtn").disabled = false;
		document.getElementById("addAllBtn").disabled = false;
		document.getElementById("result").style.display = "block";
		var url = "http://gdata.youtube.com/feeds/api/videos?max-results=5&start-index="+startIndex+"&format=5&alt=json&q=";
		var spaceIdx = keyword.indexOf(" ");
		if(spaceIdx != -1) {
			keyword = keyword.replace(" ", "+");
		}
		url += keyword;
		makeRequest(url, "N");
	} else {
		document.getElementById("result").style.display = "none";
		document.getElementById("addAllBtn").disabled = true;
		document.getElementById("addBtn").disabled = true;
		document.getElementById("subBtn").disabled = true;
	}
}

function addItem(obj) {
	var id = obj.id;
	id = id.substr(1, id.length - 1);
	
	listArray.push({duration:obj.getAttribute("data-dur"), file:obj.getAttribute("data-fil"), image:obj.getAttribute("data-ima"), title:obj.getAttribute("data-tit")});

	localStorage["playlist"] =  JSON.stringify(listArray);
	chrome.extension.getBackgroundPage().loadPlaylistByJsArray(listArray);
}

function addAllItem() {
	var resultContainer = document.getElementById("result");
	var ele = resultContainer.getElementsByTagName("div");
	for (var i = 0; i < ele.length; i++) {
		listArray.push({duration:ele[i].getAttribute("data-dur"), file:ele[i].getAttribute("data-fil"), image:ele[i].getAttribute("data-ima"), title:ele[i].getAttribute("data-tit")});
	}
	localStorage["playlist"] =  JSON.stringify(listArray);
	chrome.extension.getBackgroundPage().loadPlaylistByJsArray(listArray);
}

function removeSong(obj) {
	var id = obj.id.substr(3, obj.id.length - 1);
	removeItem(id);
}

function removeItem(id) {
	listArray.splice(id, 1);
	localStorage["playlist"] = JSON.stringify(listArray);
	chrome.extension.getBackgroundPage().loadPlaylistByJsArray(listArray);			
}

function addStartIndex() {
	startIndex += 5;
	search(document.getElementById("searchBar"));
}

function subStartIndex() {
	if(startIndex > 5) {
		startIndex -= 5;
	}
	search(document.getElementById("searchBar"));
}

function makeRequest(url, mode) {
	http_request = false;
	if (window.XMLHttpRequest) { // Mozilla, Safari,...
		http_request = new XMLHttpRequest();
		if (http_request.overrideMimeType) {
			http_request.overrideMimeType('text/xml');
		}
	}

	if (!http_request) {
		alert('Giving up :( Cannot create an XMLHTTP instance');
		return false;
	}

	if(mode == "N") {
		http_request.onreadystatechange = createSearchResult;
	} else if(mode == "S") {
		http_request.onreadystatechange = createSmartSearchResult;
	}
	http_request.open('GET', url, true);
	http_request.send(null);

}

function createSearchResult() {

	if (http_request.readyState == 4) {
		var jsonResult = http_request.responseText;
		jsonObject = JSON.parse(jsonResult);
		resultContainer = document.getElementById("result");

		//init container
		while(resultContainer.hasChildNodes()) {
			resultContainer.removeChild(resultContainer.lastChild);
		}

		for(var i = 0; i < jsonObject.feed.entry.length; i++) {
			if(jsonObject.feed.entry[i].media$group.media$thumbnail != undefined) {	//video broken

				var resultDIV = document.createElement("div");
				resultDIV.className = "searchResultItem";
				resultDIV.title = "Add to playlist";

				//custom attrs
				resultDIV.setAttribute("data-dur", jsonObject.feed.entry[i].media$group.yt$duration.seconds);
				resultDIV.setAttribute("data-fil", jsonObject.feed.entry[i].link[0].href);
				resultDIV.setAttribute("data-ima", jsonObject.feed.entry[i].media$group.media$thumbnail[0].url);
				resultDIV.setAttribute("data-tit", jsonObject.feed.entry[i].title.$t);

				resultDIV.id = "r" + i;
				resultDIV.onclick = function() { addItem(this); };
				
				var resultIMG = document.createElement("img");

				resultIMG.src = jsonObject.feed.entry[i].media$group.media$thumbnail[0].url;
				resultIMG.className = "resultImage";

				var resultTitle = document.createElement("span");
				resultTitle.innerHTML =  jsonObject.feed.entry[i].title.$t;

				resultDIV.appendChild(resultIMG);
				resultDIV.appendChild(resultTitle);
				resultContainer.appendChild(resultDIV);
			}
		}

	}

}


function createSmartSearchResult() {
	if (http_request.readyState == 4) {
		var jsonResult = http_request.responseText;
		jsonObject = JSON.parse(jsonResult);
		resultContainer = document.getElementById("result");
		
		var jsonStartIndex = jsonObject.feed.openSearch$startIndex.$t;
		var jsonTotalResults = jsonObject.feed.openSearch$totalResults.$t;
		var jsonItemsPerPage = jsonObject.feed.openSearch$itemsPerPage.$t;

		for(var i = 0; i < jsonObject.feed.entry.length; i++) {
			if(jsonObject.feed.entry[i].media$group.media$thumbnail != undefined) {	//video broken

				var resultDIV = document.createElement("div");
				resultDIV.className = "searchResultItem";
				resultDIV.title = "Add to playlist";

				//origional duration: jsonObject.feed.entry[i].media$group.media$content[0].duration  (before 0.7.0.1)
				//custom attrs
				resultDIV.setAttribute("data-dur", jsonObject.feed.entry[i].media$group.yt$duration.seconds);
				resultDIV.setAttribute("data-fil", jsonObject.feed.entry[i].link[0].href);
				resultDIV.setAttribute("data-ima", jsonObject.feed.entry[i].media$group.media$thumbnail[0].url);
				resultDIV.setAttribute("data-tit", jsonObject.feed.entry[i].title.$t);

				resultDIV.id = "r" + i;
				resultDIV.onclick = function() { addItem(this); };
				
				var resultIMG = document.createElement("img");

				resultIMG.src = jsonObject.feed.entry[i].media$group.media$thumbnail[0].url;
				resultIMG.className = "resultImage";

				var resultTitle = document.createElement("span");
				resultTitle.innerHTML =  jsonObject.feed.entry[i].title.$t;

				resultDIV.appendChild(resultIMG);
				resultDIV.appendChild(resultTitle);
				resultContainer.appendChild(resultDIV);
			}
		}

		//load until EOF
		if (parseInt(jsonItemsPerPage) + parseInt(jsonStartIndex) - 1 < parseInt(jsonTotalResults)) {
			var url = jsonObject.feed.id.$t + "?alt=json&max-results=" + jsonItemsPerPage +"&start-index="+(parseInt(jsonItemsPerPage) + parseInt(jsonStartIndex));
			makeRequest(url, "S");
		}
		document.getElementById("addAllBtn").disabled = false;	//enable add all items
		
	}
}

function searchDirectLink(url) {
	http_request = false;
	if (window.XMLHttpRequest) { // Mozilla, Safari,...
		http_request = new XMLHttpRequest();
		if (http_request.overrideMimeType) {
			http_request.overrideMimeType('text/xml');
		}
	}

	if (!http_request) {
		alert('Giving up :( Cannot create an XMLHTTP instance');
		return false;
	}
	

	http_request.onreadystatechange = function () {
										if (http_request.readyState == 4) {
											document.getElementById("result").style.display = "block";
											if (http_request.status == 0 || http_request.status == 200) {	//not init or succesful
												var container = document.getElementById("result");
												var newItem = document.createElement("div");
												newItem.className = "searchResultItem";
																																				
												var newTitleSpan = document.createElement("span");
												newTitleSpan.innerHTML = "Title:";
												
												var newTitle = document.createElement("input");
												newTitle.id = "searchResultTitle";
												newTitle.type = "text";
												newTitle.value = url;
												newTitle.setAttribute("data-url", url);

												var newAddButton = document.createElement("button");
												newAddButton.innerHTML = "Add";
												newAddButton.onclick = function() { addDirectLinkItem(document.getElementById("searchResultTitle")); };

												newItem.appendChild(newTitleSpan);
												newItem.appendChild(newTitle);
												newItem.appendChild(newAddButton);
												container.appendChild(newItem);
												
											} else {	//error ex:404
												alert("Error Code:" + http_request.status);
											}
										}
									};
	http_request.open('GET', url, true);
	http_request.send(null);

}

function addDirectLinkItem(obj) {
	listArray.push({file:obj.getAttribute("data-url"), title:obj.value});
	localStorage["playlist"] =  JSON.stringify(listArray);
	chrome.extension.getBackgroundPage().loadPlaylistByJsArray(listArray);
	document.getElementById("result").style.display = "none";
	document.getElementById("smartURL").value = "";
}

//search by video id(YouTube)
function searchYouTubeVideo(url) {
	var script = document.createElement("script");
	script.src = url + "?alt=json&callback=createSearchVideoResult";
	document.getElementsByTagName('head')[0].appendChild(script);
}

function createSearchVideoResult(obj) {
	var resultContainer = document.getElementById("result");
	document.getElementById("result").style.display = "block";
	//init container
	while(resultContainer.hasChildNodes()) {
		resultContainer.removeChild(resultContainer.lastChild);
	}

	var resultDIV = document.createElement("div");
	resultDIV.className = "searchResultItem";
	resultDIV.title = "Add to playlist";

	//custom attrs
	resultDIV.setAttribute("data-dur", obj.entry.media$group.media$content[0].duration);
	resultDIV.setAttribute("data-fil", obj.entry.link[0].href);
	resultDIV.setAttribute("data-ima", obj.entry.media$group.media$thumbnail[0].url);
	resultDIV.setAttribute("data-tit", obj.entry.title.$t);
	resultDIV.id = "r0";
	resultDIV.onclick = function() { addItem(this); };

	var resultIMG = document.createElement("img");

	resultIMG.src = obj.entry.media$group.media$thumbnail[0].url;
	resultIMG.className = "resultImage";

	var resultTitle = document.createElement("span");
	resultTitle.innerHTML = obj.entry.title.$t;

	resultDIV.appendChild(resultIMG);
	resultDIV.appendChild(resultTitle);
	resultContainer.appendChild(resultDIV);

	
}