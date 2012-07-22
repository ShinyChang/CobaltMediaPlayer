function getSuggest(obj) {
	var key = obj.value;
	var script = document.createElement("script");
	script.src ="http://suggestqueries.google.com/complete/search?hl=en&ds=yt&json=t&callback=parseResult&q=" + key;
	document.getElementsByTagName('head')[0].appendChild(script);
}

function parseResult (obj) {
	var container = document.getElementById("suggestPlaceHolder");
	container.innerHTML = "";
	if(obj[1].length > 0) {
		for(var i = 0; i < 5; i++) {
			var newSuggest = document.createElement("li");	
			newSuggest.id="sg_" + i;
			newSuggest.innerHTML = obj[1][i];
			newSuggest.className = "suggetItem";
			newSuggest.setAttribute("data-suggest", obj[1][i]);
			newSuggest.onclick = function() { replaceSearchKeyWord(this); };
			container.appendChild(newSuggest);
		}
	}
}

function replaceSearchKeyWord(obj) {
	var search = document.getElementById("searchBar");
	search.value = obj.getAttribute("data-suggest");
	preSearch(search);
	document.getElementById("suggestPlaceHolder").style.display = "none";
}
