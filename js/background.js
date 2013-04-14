/////////////////////////////////////////////////////////////////////////////////////
// init
var __ver    = localStorage.getItem("ver"),
    player   = null,
    playlist = JSON.parse(localStorage.getItem("playlist")) || [],
    _idx     = null,
    _random  = localStorage.getItem('random') || false,
    _loop    = localStorage.getItem('loop') || false,
    _volume  = localStorage.getItem('volume') || 1,
    _mute    = localStorage.getItem('mute') || false,
    REAL_PATH_CACHE_TIME_LIMIT = 10 * 60 * 1000; // 10 mins
    
$(function(){
    // version control
    if(__ver !== "0.9.0.0") {
        clearPlaylist();    // older playlist can not be used
        localStorage.setItem("ver", "0.9.0.0");
    }

    player = $("#player").get(0);
    setLoop(_loop);

    updateBadge("INIT");

    $("#player").bind("ended", function() {
        playNext();
    }).bind("timeupdate", function(){
        updateBadge(timeFormat(Math.round(getDuration()) - Math.round(getCurrentTime())));
    }).bind("pause", function(){
        updateBadge("STOP");
    }).bind("error", function(){
        updateBadge("ERR!");
    }).bind("emptied", function(e){
        updateBadge("EMPT");
    }).bind("stalled", function(){
        updateBadge("STAL");
    }).bind("waiting", function(){
        updateBadge("WAIT");
    })

    setInterval(updateRealPath, 1 * 60 * 1000); // every 1 min
    updateBadge("RDY!");
});
/////////////////////////////////////////////////////////////////////////////////////



/////////////////////////////////////////////////////////////////////////////////////
// event function
function updateBadge(text) {
	if (typeof text === 'number') {
        text = Math.round(text).toString();
    }
	chrome.browserAction.setBadgeText({text: text});
}
/////////////////////////////////////////////////////////////////////////////////////



/////////////////////////////////////////////////////////////////////////////////////
// player API
function getBuffered() {
    var range = null;
    if(player.buffered.length) {
        range = '';
        for (var i=0, max=player.buffered.length; i<max; ++i) {
            range = player.buffered.end(i);
        }
    }
    return range;
}

function getPlaylistTitle() {
    var title = '';
    var src = player.currentSrc;
    
    $.each(playlist, function(idx, item){
        if(src == item.realPath) {
            title = item.title;
            return false;
        }
    });
    return title;
}

function getPlaylist() {
    return playlist;
}

function getRandom() {
    return _random;
}

function getPlayState() {
    return (player.paused === false);
}

function getCurrentTime(){
    return player.currentTime;
}

function getDuration() {
    return isNaN(player.duration) ? 0 : player.duration;
}

function togglePlayState() {
    if(player.paused === true) {
        play();
    } else {
        pause();
    }
}

function toggleLoop() {
    var loop = getLoopState();
    setLoop(!loop);
}

function toggleRandom() {
    var rnd = getRandom();
    setRandom(!rnd);
}

function toggleMute() {
    var mute = getMuteState();
    mute(!mute);
}

function clearPlaylist() {
    $("#player").html("");
    playlist = [];
    localStorage.removeItem("playlist");
}

function removePlaylistItem(index) {
    playlist.splice(index, 1);
    localStorage.setItem("playlist", JSON.stringify(playlist));
}

function playItem(index) {
    _idx = index;
    updateRealPath();
    player.src= playlist[_idx].realPath;
    player.play();
}

function play() {
    if(playlist.length == 0) return;
    updateRealPath();

    if(_idx === null) {
        _idx = 0;
        player.src = playlist[_idx].realPath;
    }

    player.play();
}

function playNext() {
    var item = getNextPlaylistItem();
    if(item === null) return;
    player.src= item.realPath;
    play();
}

function playPrev() {
    var item = getPrevPlaylistItem();
    if(item === null) return;
    player.src= item.realPath;
    play();
}

function pause() {
    player.pause();
}

function getNextPlaylistItem() {
    if(playlist.length == 0) return null;
    _idx++;
    if(_idx > playlist.length) _idx = 0;
    return playlist[_idx];
}

function getPrevPlaylistItem() {
    if(playlist.length == 0) return null;
    _idx--;
    if(_idx < 0) {
        _idx = playlist.length - 1;
    }
    return playlist[_idx];
}

function seek(time) {
    player.currentTime = time;
}

function mute(mute) {
    localStorage.setItem('mute', mute);
    player.mute = mute;
}

function getMuteState() {
    return player.mute;
}

function setLoop(loop) {
    player.loop = loop;
    localStorage.setItem('loop', loop);
}

function setRandom(rnd) {
    _random = rnd;
    localStorage.setItem('random', _random);
}

function getLoopState() {
    return player.loop;
}

function getVolume() {
    return player.volume;
}

function setVolume(volume) {
    localStorage.setItem('volume', volume);
    player.volume = volume;
}




/**
 * [addYouTubeToPlaylist description]
 * @param {[object]} obj {title, link, thumb, duration, videoID, realPath, type}
 */
function addYouTubeToPlaylist(obj) {
    if(typeof obj !== 'object' || typeof obj.videoID === 'undefined' || obj.videoID === '') return false;
    var alreadyExist = false;

    $.each(playlist, function(idx, val){

        // update videoID if already exist
        if(playlist[idx].link === obj.link) {
            alreadyExist = true;
            playlist[idx].lastUpdate = (new Date()).getTime();
            return false;
        }
    });

    if(alreadyExist === false) {
        playlist.push(obj);
        localStorage.setItem('playlist', JSON.stringify(playlist));
    }

    if($("#player").prop('src') == "") {
        $("#player").prop('src', obj.realPath);
    }
    return true;
}

/**
 * [loadVideo description]
 * @param  {object} obj {title, link, thumb, duration}
 */
function loadVideo(obj) {
    if (typeof obj !== "object") return false;
    var result = false;
    var youTubeRegExp = /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
    var match = obj.link.match(youTubeRegExp);
    if (match) {
        // info {'realPath', 'type', 'videoID'}
        var info = getYouTubeVideoInfo(match[1]);
        for(var key in info) {
            obj[key] = info[key];
        }
        result = addYouTubeToPlaylist(obj);
    } else {
        // TODO load direct Video
    }
    return result;
}

function searchYouTube(keyword, startIndex) {
    if (typeof keyword === "undefined" || keyword === '') return null;
    if (typeof startIndex !== 'int' || startIndex < 1) startIndex = 1;

    keyword = keyword.replace(" ", "+"); // multiple keyword
    var searchResult = [],
        param = {
            'max-results' : 5,
            'start-index' : startIndex,
            'format'      : 5,
            'alt'         : 'json',
            'q'           : keyword
        };

    $.ajax({
        url      : 'http://gdata.youtube.com/feeds/api/videos',
        data     : param,
        dataType : 'json',
        async    : false
    }).done(function(obj) {
        for(var i = 0, max = obj.feed.entry.length; i < max; ++i) {

            // video broken (has been removed)
            if(obj.feed.entry[i].media$group.media$thumbnail === undefined) return;

            searchResult[i] = {
                'duration' : obj.feed.entry[i].media$group.yt$duration.seconds,
                'link'     : obj.feed.entry[i].link[0].href,
                'thumb'    : obj.feed.entry[i].media$group.media$thumbnail[0].url,
                'title'    : obj.feed.entry[i].title.$t
            }
        }
    });

    return searchResult;
}

/////////////////////////////////////////////////////////////////////////////////////



/////////////////////////////////////////////////////////////////////////////////////
//common
function updateRealPath() {
    var ANY_UPDATED = false;
    $.each(playlist, function(idx, pl){

        // cache
        if((new Date()).getTime() - pl.lastUpdate <= REAL_PATH_CACHE_TIME_LIMIT) return true;
        ANY_UPDATED = true;

        $.ajax({
            url      : "http://www.youtube.com/get_video_info",
            data     : {'video_id': pl.videoID, 'asv': 2},
            dataType : "text",
            async    : true
        }).done(function(data) {
            var info    = {},
                results = [];
            parseYouTubeVideoInfoString(data, info);

            // the video which is not allowed to be embedded
            if(info['status'] === 'fail') return null;

            var streams = explode(',', info['url_encoded_fmt_stream_map']);
            for(var i=0; i<streams.length; i++){
                var real_stream = {};
                parseYouTubeVideoInfoString(streams[i], real_stream);
                real_stream['url'] += '&signature=' + real_stream['sig'];
                results.push(real_stream);
            }
            if (results.length > 0) {
                $.each(results, function(index, value) {

                    // itag 18: medium mp4
                    if (value.itag === '18') {
                        playlist[idx].realPath = value.url;
                        playlist[idx].lastUpdate = (new Date()).getTime();
                    }
                });
            }
        });
    });
    if (ANY_UPDATED) {
        localStorage.setItem('playlist', JSON.stringify(playlist));
    }
}

function timeFormat(t) {
    t = parseInt(t);
    if (isNaN(t) || t < 0) {
        t = 0;
    }
    var m = Math.floor(t / 60);
    var s = t % 60;
    if(m < 10) {
        m = "0" + m;
    }
    if(s < 10) {
        s = "0" + s;
    }
    return m + ":" + s;
}
/////////////////////////////////////////////////////////////////////////////////////



/////////////////////////////////////////////////////////////////////////////////////
// parser
function getYouTubeVideoInfo(youtubeVideoID){
    if (typeof youtubeVideoID === "undefined" || youtubeVideoID === '') return null;
    
    var id        = youtubeVideoID,
        results   = [],
        videoInfo = null;

    $.ajax({
        url      : "http://www.youtube.com/get_video_info",
        data     : {'video_id': id, 'asv': 2},
        dataType : "text",
        async    : false
    }).done(function(data) {

        var info = {};
        parseYouTubeVideoInfoString(data, info);

        // the video which is not allowed to be embedded
        if(info['status'] === 'fail') return null;

        var streams = explode(',', info['url_encoded_fmt_stream_map']);
        for(var i=0; i<streams.length; i++){
            var real_stream = {};
            parseYouTubeVideoInfoString(streams[i], real_stream);
            real_stream['url'] += '&signature=' + real_stream['sig'];
            results.push(real_stream);
        }
        if (results.length > 0) {
            $.each(results, function(index, value) {

                // itag 18: medium mp4
                if (value.itag === '18') {
                    var _type = value.type.substring(0, value.type.indexOf(";"));
                    videoInfo = {'realPath': value.url, 'type': _type, 'videoID': id};
                }
            });
        }
    });

    return videoInfo;
}

function parseYouTubeVideoInfoString(str, array) {
    var strArr = String(str).replace(/^&/, '').replace(/&$/, '').split('&'),
    sal = strArr.length,
    i, j, ct, p, lastObj, obj, lastIter, undef, chr, tmp, key, value,
    postLeftBracketPos, keys, keysLen,
    fixStr = function (str) {
        return decodeURIComponent(str.replace(/\+/g, '%20'));
    };
    if (!array) {
        array = this.window;
    }
    for (i = 0; i < sal; i++) {
        tmp = strArr[i].split('=');
        key = fixStr(tmp[0]);
        value = (tmp.length < 2) ? '' : fixStr(tmp[1]);

        while (key.charAt(0) === ' ') {
            key = key.slice(1);
        }
        if (key.indexOf('\x00') > -1) {
            key = key.slice(0, key.indexOf('\x00'));
        }
        if (key && key.charAt(0) !== '[') {
            keys = [];
            postLeftBracketPos = 0;
            for (j = 0; j < key.length; j++) {
                if (key.charAt(j) === '[' && !postLeftBracketPos) {
                    postLeftBracketPos = j + 1;
                }
                else if (key.charAt(j) === ']') {
                    if (postLeftBracketPos) {
                        if (!keys.length) {
                            keys.push(key.slice(0, postLeftBracketPos - 1));
                        }
                        keys.push(key.substr(postLeftBracketPos, j - postLeftBracketPos));
                        postLeftBracketPos = 0;
                        if (key.charAt(j + 1) !== '[') {
                            break;
                        }
                    }
                }
            }
            if (!keys.length) {
                keys = [key];
            }
            for (j = 0; j < keys[0].length; j++) {
                chr = keys[0].charAt(j);
                if (chr === ' ' || chr === '.' || chr === '[') {
                    keys[0] = keys[0].substr(0, j) + '_' + keys[0].substr(j + 1);
                }
                if (chr === '[') {
                    break;
                }
            }

            obj = array;
            for (j = 0, keysLen = keys.length; j < keysLen; j++) {
                key = keys[j].replace(/^['"]/, '').replace(/['"]$/, '');
                lastIter = j !== keys.length - 1;
                lastObj = obj;
                if ((key !== '' && key !== ' ') || j === 0) {
                    if (obj[key] === undef) {
                        obj[key] = {};
                    }
                    obj = obj[key];
                }
                else { // To insert new dimension
                    ct = -1;
                    for (p in obj) {
                        if (obj.hasOwnProperty(p)) {
                            if (+p > ct && p.match(/^\d+$/g)) {
                                ct = +p;
                            }
                        }
                    }
                    key = ct + 1;
                }
            }
            lastObj[key] = value;
        }
    }
}

function explode(delimiter, string, limit) {
    if ( arguments.length < 2 || typeof delimiter === 'undefined' || typeof string === 'undefined' ) return null;
    if ( delimiter === '' || delimiter === false || delimiter === null) return false;
    if ( typeof delimiter === 'function' || typeof delimiter === 'object' || typeof string === 'function' || typeof string === 'object'){
        return { 0: '' };
    }
    if ( delimiter === true ) delimiter = '1';
    delimiter += '';
    string += '';
    var s = string.split( delimiter );
    if ( typeof limit === 'undefined' ) return s;
    if ( limit === 0 ) limit = 1;
    if ( limit > 0 ){
        if ( limit >= s.length ) return s;
        return s.slice( 0, limit - 1 ).concat( [ s.slice( limit - 1 ).join( delimiter ) ] );
    }
    if ( -limit >= s.length ) return [];
    s.splice( s.length + limit );
    return s;
}
/////////////////////////////////////////////////////////////////////////////////////