function Nav($scope) {
    $scope.navs = [
        {text: 'Badge',          target: '_self',  link: '#badge'},
        {text: 'Playlist',       target: '_self',  link: '#playlist'},
        {text: 'GitHub project', target: '_blank', link: 'https://github.com/ShinyChang/CobaltMediaPlayer'},
        {text: 'Bug report',     target: '_blank', link: 'https://chrome.google.com/webstore/support/lomkdjfdigkefccckbebcanbmndlfjjk'}
    ]
}

function Badge($scope) {
    $scope.badges = [
        {status: 'INIT',  level: "success", description: "Initializing"},
        {status: 'RDY!',  level: "success", description: "Ready to play"},
        {status: '##:##', level: "info",    description: "Remaining time"},
        {status: 'STOP',  level: "info",    description: "Paused"},
        {status: 'WAIT',  level: "warning", description: "Playback stops because the next frame of video isn't available (might be buffering)"},
        {status: 'STAL',  level: "warning", description: "Downloading has been interrupted for more than three seconds (This can indicate a network problem)"},
        {status: 'ERR!',  level: "error",   description: "Fatal error"},
        {status: 'EMPT',  level: "error",   description: "The video object is reset to its initial state (This may indicate a network problem)"}
    ];
}

function Playlist($scope) {
    $scope.playlist = chrome.extension.getBackgroundPage().getPlaylist();
}


