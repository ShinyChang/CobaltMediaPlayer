var cmp = {
	startIndex: 1,
	repeat: false,
	random: false,
	mute: false,
	playing: false,
	volumn: 100,
	listArray: [],
	init: function() {
		cmp.listArray = chrome.extension.getBackgroundPage().getPlaylist();
		cmp.repeat = chrome.extension.getBackgroundPage().getLoopState();
		cmp.random = chrome.extension.getBackgroundPage().getRandom();
		cmp.mute = chrome.extension.getBackgroundPage().getMuteState();
		cmp.playing = chrome.extension.getBackgroundPage().getPlayState();
		cmp.volumn = chrome.extension.getBackgroundPage().getVolume();
		if(!cmp.playing) {
			$("#playBtn").children(0).attr("class","icon-play");
		} else {
			$("#playBtn").children(0).attr("class","icon-stop");
		}
		if(cmp.repeat) {
			$("#repeatBtn").children(0).toggleClass("icon-white");
		}
		if(cmp.random) {
			$("#randomBtn").children(0).toggleClass("icon-white");
		}
		if(cmp.mute) {
			$("#volumnBtn").children(0).toggleClass("icon-white");
		}
		$("#volumnBar").attr("value", cmp.volumn);
		$("#songTitleContainer").html(chrome.extension.getBackgroundPage().getPlaylistTitle());
		var d = chrome.extension.getBackgroundPage().getDuration();
		$("#duration_time").html(Math.floor(d/60)+":"+Math.floor(d%60));
		cmp.updatePlaylist();
		cmp.updateTitle();
		cmp.updateTineBar();
	},
	search: function() {
		startIndex = 1;
		if($("#searchBar").val().length > 0) {
			cmp.sendSearchRequest();
		} else {
			$("#searchResultContainer>table>tbody").html("");
		}
	},
	searchNextPage: function() {
		startIndex +=5;
		cmp.sendSearchRequest();
	},
	searchPrevPage: function() {
		startIndex -=5;
		if(startIndex <= 0) {
			startIndex  = 1;
		}
		cmp.sendSearchRequest();
	},
	sendSearchRequest: function() {
		$.ajax({
		  	url: "http://gdata.youtube.com/feeds/api/videos?max-results=5&start-index="+startIndex+"&format=5&alt=json&q="+$("#searchBar").val(),
		  	dataType: "json",
		  	cache: false
		})
		.done(cmp.parseSearchResult);
	},
	parseSearchResult:function (jsonObject) {

		//clear search result
		var resultContainer = $("#searchResultContainer>table>tbody");
		resultContainer.html("");

		//generate 5 search result
		for(var i = 0; i < 5; i++) {
			var duration = jsonObject.feed.entry[i].media$group.yt$duration.seconds;

			var seconds = duration % 60;
			var minutes = Math.floor(duration / 60);
			resultContainer.append(
				$("<tr/>").append(
					$("<td/>").append(
						$("<img/>")
						.attr("src", jsonObject.feed.entry[i].media$group.media$thumbnail[0].url)
						.attr("class", "videoThumbnail")
					)
				)
				.append(
					$("<td/>")
						.html(jsonObject.feed.entry[i].title.$t+"<br/>"+minutes+":"+seconds)
						.css("cursor","pointer")
						.attr("data-dur", jsonObject.feed.entry[i].media$group.yt$duration.seconds)
						.attr("data-fil", jsonObject.feed.entry[i].link[0].href)
						.attr("data-ima", jsonObject.feed.entry[i].media$group.media$thumbnail[0].url)
						.attr("data-tit", jsonObject.feed.entry[i].title.$t)
						.attr("id", "r"+i)
						.attr("title", "Add this song to playlist")
						.click(function(){
							var id = this.id;
							id = id.substr(1, id.length - 1);
							cmp.listArray.push({duration:this.getAttribute("data-dur"), file:this.getAttribute("data-fil"), image:this.getAttribute("data-ima"), title:this.getAttribute("data-tit")});
							localStorage["playlist"] =  JSON.stringify(cmp.listArray);
							chrome.extension.getBackgroundPage().loadPlaylistByJsArray(cmp.listArray);
							cmp.updatePlaylist();
						})
				)
				.append(
					$("<td/>").append(
						$("<img/>")
							.attr("src", "img/yt.png")
							.attr("title", "Watch on YouTube")
							.attr("data-videoUrl", jsonObject.feed.entry[i].link[0].href)
							.css("cursor","pointer")
							.click(function(){
								chrome.tabs.create({'url': $(this).attr("data-videoUrl")});
							})
					)
				)
			)
		}
	},
	updatePlaylist: function(){
		var playlist = chrome.extension.getBackgroundPage().getPlaylist();
		$("#playlistContainer>table>tbody").html("");
		for(var i = 0; i < playlist.length; i++) {
			$("#playlistContainer>table>tbody").append(
				$("<tr/>").append(
					$("<td/>").append(
						$("<a/>")
							.attr("rel", "tooltip")
							.attr("id", i)
							.attr("title", $("<img/>").attr("class", "videoThumbnail").attr("src",playlist[i].image)[0].outerHTML)
							.html(playlist[i].title)
							.css("cursor","pointer")
							.click(function(){
								console.log("GET");
								chrome.extension.getBackgroundPage().playlistItem(this.id);
							})
					)
				).append(
					$("<td/>").append(
						$("<i/>")
							.attr("class", "icon-remove")
							.attr("title", "remove thie song")
							.attr("id", "del" + i)
							.css("cursor","pointer")
							.click(function(){
								cmp.listArray.splice(this.id.substr(3, this.id.length - 1), 1);
								localStorage["playlist"] = JSON.stringify(cmp.listArray);
								chrome.extension.getBackgroundPage().loadPlaylistByJsArray(cmp.listArray);		
								cmp.updatePlaylist();
							})
					)
				)
			)
		}
		$("a").tooltip();
	},
	updateTitle:function(){
		$("#songTitleContainer").html(chrome.extension.getBackgroundPage().getPlaylistTitle());
	},
	updateTineBar:function() {

		$("#timeBar").attr("max", chrome.extension.getBackgroundPage().getDuration())
					 .attr("value", chrome.extension.getBackgroundPage().getPosition());

		var max = $("#timeBar").attr("max");
		var now = $("#timeBar").attr("value");
		if($("#timeBar").attr("max") > 0) {
			$("#now_time").html(Math.floor(now/60)+":"+Math.floor(now%60));
			$("#duration_time").html(Math.floor(max/60)+":"+Math.floor(max%60));
		}
	}
};

//document ready
$(function(){
	cmp.init();

	//tooltip setting
	$("a").tooltip();

	//search youtube
	$("#searchBar").keyup(cmp.search);
	$("#prevBtn").click(cmp.searchPrevPage);
	$("#nextBtn").click(cmp.searchNextPage);
	

	//event binding
	//player control
	$("#playPrevBtn").click(function(){
		chrome.extension.getBackgroundPage().playlistPrev();
	});
	$("#playBtn").click(function() {
		if(cmp.playing) {
			$(this).children(0).attr("class","icon-play");
		} else {
			$(this).children(0).attr("class","icon-stop");
		}
		cmp.playing = !cmp.playing;
		chrome.extension.getBackgroundPage().start();
	});			
	$("#playNextBtn").click(function(){
		chrome.extension.getBackgroundPage().playlistNext();
	});	
	$("#repeatBtn").click(function(){
		$(this).children(0).toggleClass("icon-white");
		cmp.repeat = !cmp.repeat;
		chrome.extension.getBackgroundPage().setLoopState(cmp.repeat);
	});
	$("#randomBtn").click(function(){
		$(this).children(0).toggleClass("icon-white");
		cmp.random = !cmp.random;
		chrome.extension.getBackgroundPage().setRandom(cmp.random);
	});
	$("#volumnBtn").click(function(){
		$(this).children(0).toggleClass("icon-white");
		cmp.mute = !cmp.mute;
		chrome.extension.getBackgroundPage().setMute(cmp.mute);
	});

	$("#volumnBar").change(function(){
		cmp.volumn = $(this).val();
		chrome.extension.getBackgroundPage().setVolume(cmp.volumn);
	});
	$("#newListBtn").click(function(){
		cmp.listArray =[];
		cmp.listArray.push({duration:"296", file:"http://www.youtube.com/watch?v=3JC27eE-BPw&feature=youtube_gdata", image:"http://i.ytimg.com/vi/3JC27eE-BPw/0.jpg", title:"梁靜茹 - 愛久見人心 完整CD版"});
		cmp.listArray.splice(0, cmp.listArray.length - 1);
		localStorage["playlist"] = JSON.stringify(cmp.listArray);
		chrome.extension.getBackgroundPage().loadPlaylistByJsArray(cmp.listArray);
		cmp.updatePlaylist();
	});
	$("#timeBar").mouseup(function(){
		chrome.extension.getBackgroundPage().setTime($(this).val());
	});

	//update
	setInterval(cmp.updateTineBar, 500);	//update timer (every 0.5 sec)
	setInterval(cmp.updateTitle, 1000);	//update timer (every 1 sec)
});

