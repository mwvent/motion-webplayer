/*
  This file is part of motion-webplayer
  Copyright (C) 2015 Matthew Watts
  motion-webplayer is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License version 2 as published by
  the Free Software Foundation
  
  motion-webplayer is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with motion-webplayer.  If not, see <http://www.gnu.org/licenses/>.
  
  Contains portions of code from Dag Erlandsson (langarod@gmail.com) - http://www.lavrsen.dk/foswiki/bin/view/Motion/MotionJpegViewer
*/

// psuedo enum
var PLAYSTATE_NOCHANGE = -2;
var PLAYSTATE_RESET = -1;
var PLAYSTATE_STOPPED = 0;
var PLAYSTATE_PLAY_FORWARDS = 1;
var PLAYSTATE_PLAY_BACKWARDS = 2;
var PLAYSTATE_STEP_FORWARDS = 3;
var PLAYSTATE_STEP_BACKWARDS = 4;
var PLAYSTATE_STEP_START = 5;
var PLAYSTATE_STEP_END = 6;

// globals
var frame=-1;
var frameStep = 1;
var playState = PLAYSTATE_STOPPED;
var currentFeed = '';
var feeds = new Array();
var frame_list = new Array();
var jpeg_mode = true;



$( document ).ready(function() {
	// Update Feeds List
	$.ajax({
		url: "feedlist.php",
		dataType: "json",
		success: function(data) {
			feeds=data;
			var feedsHTML = "";
			for (currentFeedIndex in feeds) {
				feedsHTML += "<span id='" + feeds[currentFeedIndex][0] + 
				"' data-feed='" + feeds[currentFeedIndex][0] + 
				"' class='feedUnSelect'>" + feeds[currentFeedIndex][0] +"</span>";
			}
			destDiv = document.getElementById('feedbuttons_container');
			destDiv.innerHTML = feedsHTML;
		},
		error: function (request, status, error) {
			alert(request.responseText);
		}
	});
	$("#image1").load(function() {
		updateUIPositionInfo();
		loadNextFrame(PLAYSTATE_NOCHANGE);
	});
	$("#video1").on("timeupdate", function (e) {
		frameTime = 1 / 25; //assume 25 fps
		if ( playState == PLAYSTATE_PLAY_FORWARDS ) {
			frame = Math.floor( video1.currentTime / frameTime );
			updateUIPositionInfo();
			loadNextFrame(PLAYSTATE_NOCHANGE);
		} else {
			updateUIPositionInfo();
		}
	});
	$('#feedbuttons_container').on('click', '.feedUnSelect', function() {
		enterFeed($(this).data("feed"));
	});
	$('#txtFeedDate').on('change', function() {
		dateClick();
	});
});

$(document).keydown( function(event) {
	key_up = 38;
	key_down = 40;
	key_left = 37;
	key_right = 39;
	key_left_comma = 188;
	key_right_stop = 190;
	switch(event.which) {
		case key_up : 
			loadNextFrame(PLAYSTATE_STOPPED);
			break;
		case key_down :
			loadNextFrame(PLAYSTATE_STOPPED);
			break;
		case key_left :
			loadNextFrame(PLAYSTATE_PLAY_BACKWARDS);
			break;
		case key_right :
			loadNextFrame(PLAYSTATE_PLAY_FORWARDS);
			break;
		case key_left_comma :
			loadNextFrame(PLAYSTATE_STEP_BACKWARDS);
			break;
		case key_right_stop :
			loadNextFrame(PLAYSTATE_STEP_FORWARDS);
			break;
	}
}); 

function loadNextFrame(newPlayState) {
	if(newPlayState !== PLAYSTATE_NOCHANGE && newPlayState != PLAYSTATE_PLAY_FORWARDS && ! video1.paused) {
		video1.pause();
	}
	if(newPlayState !== PLAYSTATE_NOCHANGE) {
		playState = newPlayState;
	}
	updateUIPositionInfo();
	frame=Number(frame);
	oldFrame = frame;
	switch(playState) {
		case PLAYSTATE_STOPPED: // stopped - no next frame to load
			break;
		case PLAYSTATE_PLAY_FORWARDS: // playing forwards
			if ( frame_list[frame]['frame_filehash'] == "video" ) {
				video1.playbackRate = 2.0;
				video1.defaultPlaybackRate = 2.0;
				video1.play();
			} else {
				if( (frame + frameStep) < frame_list.length ) {
					frame+=frameStep;
				} else {
					playState=PLAYSTATE_STOPPED;
				}
			}
			break;
		case PLAYSTATE_PLAY_BACKWARDS: // playing backwards
			if( (frame - frameStep) > -1 ) {
				frame-=frameStep;
			} else {
				playState=PLAYSTATE_STOPPED;
			}
			break;
		case PLAYSTATE_STEP_FORWARDS: // step forward one frame & stop
			if( (frame + frameStep) < frame_list.length ) {
				frame+=frameStep;
				playState = PLAYSTATE_STOPPED;
			} else {
				playState = PLAYSTATE_STOPPED;
			}
			break;
		case PLAYSTATE_STEP_BACKWARDS: // step backwards one frame & stop
			if( (frame - frameStep) > -1 ) {
				frame-=frameStep;
				playState = PLAYSTATE_STOPPED;
			} else {
				playState = PLAYSTATE_STOPPED;
			}
			break;
		case PLAYSTATE_STEP_END:
			frame = frame_list.length -1;
			break;
		case PLAYSTATE_STEP_START:
			frame = 0;
			break;
		case PLAYSTATE_RESET:
			playState = PLAYSTATE_STOPPED;
			oldFrame = -1;
			break;
	}
	if(oldFrame !== frame) {
		updateVideoPosition();
	}
}


// either update jpeg img src or set position on video player
function updateVideoPosition() {
	frameTime = 1 / 25; //assume 25 fps
	if ( frame_list[frame]['frame_filehash'] == "video" ) {
		video1.play();
		video1.currentTime = frame * frameTime;
		console.log(video1.currentTime);
		video1.pause();
		// unlike setting src on img for jpeg frame loading there will be no callback
		// for setting a video frame so we will make a callback function
		setTimeout(	updateVideoPosition_videocallback, Math.floor(frameTime * 1000));
	} else {
		var fileHash = frame_list[Number(frame)]['frame_filehash'];
		imgUrl = 'getframe.php?q=80&frame=' + encodeURIComponent(fileHash);
		img = document.getElementById('image1');
		img.src = imgUrl;
	}	
}

var updateVideoPosition_videocallback_framewaittime = 0;
function updateVideoPosition_videocallback() {
	// check video is not still seeking before returning to loadnextframe
	if ( ! video1.seeking ) {
		$('#loading_frameimage').css("display", "none");
		updateUIPositionInfo();
		loadNextFrame(PLAYSTATE_NOCHANGE);
		updateVideoPosition_videocallback_framewaittime = 0;
	} else {
		console.log("seeking");
		// if still seeking try the callback again in 10ms
		// if it has been seeking for >500ms then display the loading image
		updateVideoPosition_videocallback_framewaittime += 10;
		if ( updateVideoPosition_videocallback_framewaittime > 500 ) {
			$('#loading_frameimage').css("display", "block");
		}
		setTimeout(	updateVideoPosition_videocallback, 10);
	}
}




function updateUIPositionInfo() {
	// check if any frame is selected
	if(frame == -1) {
		return;
	}

	// select progress bar and ensure it is ready
	var progressBar = document.getElementById('progress-bar');
	progressBar.max = 24 * 60 * 60; // seconds in a day

	// get the time from the current frame (in seconds from midnight) - convert into hh mm ss and subframe number
	currentFrameFullSeconds = frame_list[Number(frame)]['frame_seconds'];
	currentFrameIndex = frame_list[Number(frame)]['subframe_index'];
	currentFrameHours = Math.floor(currentFrameFullSeconds / 3600);
	currentFrameHours_remainder = currentFrameFullSeconds%3600;
	currentFrameMins = Math.floor(currentFrameHours_remainder / 60);
	currentFrameSeconds = currentFrameHours_remainder%60;

	// pad with zeros
	currentFrameHours = ("0" + currentFrameHours).slice (-2);
	currentFrameMins = ("0" + currentFrameMins).slice (-2);
	currentFrameSeconds = ("0" + currentFrameSeconds).slice (-2);
	currentFrameIndex = ("0" + currentFrameIndex).slice (-2);

	// update document
	$('#frameTime_HH').attr('value',currentFrameHours);
	$('#frameTime_MM').attr('value',currentFrameMins);
	$('#frameTime_SS').attr('value',currentFrameSeconds);
	$('#frameTime_FF').attr('value',currentFrameIndex);
	progressBar.value = Number(frame_list[Number(frame)]['frame_seconds']);
}

function getFrameNearestToSeconds(secondsTime) {
	found_frame = 0;
	for (var i in frame_list) {
		if(frame_list[i]['frame_seconds'] < secondsTime) {
			found_frame = i;
		}
	}
	return found_frame;
}

function printDateDropdown(feedName) {
	dl = document.getElementById('txtFeedDate');

	if (typeof dl.options[dl.selectedIndex].value !== 'undefined') {
		oldFeedDate = dl.options[dl.selectedIndex].value;
	} else {
		oldFeedDate = '';
	}

	for(i = dl.options.length-1; i>=0; i--) {
		dl.options[i] = null;
	}

	selected = false;
	for(fi = 0; fi < feeds.length; fi++) {
		if(feeds[fi][0] == feedName) {
			for(di = 1; di < feeds[fi].length; di++) {
				dl.options[di-1] = new Option(feeds[fi][di]);
				dl.options[di-1].value = feeds[fi][di];
				if(feeds[fi][di] == oldFeedDate) {
					dl.options[di-1].selected = true;
					selected = true;
				}
			}
			if(selected == false) {
				dl.options[dl.options.length-1].selected=true; // select last item in list
			}
			dateClick();
		}
	}
}

function dateClick() {
	$('#loading_frameimage').css("display", "block");
	updateTimeline();
}

function updateTimeline() {
	$('#footer_container').css("display", "none");
	$('#loading_frameimage').css("display", "block");
	$('#image1').css("display", "none");
	frame = -1;
	fd = document.getElementById('txtFeedDate');
	feedDate = fd.options[fd.selectedIndex].value;
	if(currentFeed != '') {
		timeUrl = 'timeline.php?feed=' + currentFeed + '&date=' + feedDate;
		framesUrl =  'frame_list.php?feed=' + currentFeed + '&date=' + feedDate;
	} else {
		timeUrl = 'timeline.php';
	}

	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			frame_list = JSON.parse(xmlhttp.responseText);
			$('#timeline').attr('src',timeUrl);
			frame = 0;
			loadNextFrame(PLAYSTATE_RESET);
			$('#footer_container').css("display", "block");
			$('#loading_frameimage').css("display", "none");
			if ( frame_list[0]['frame_filehash'] == "video" ) {
				$('#image1').css("display", "none");
				$('#video1').css("display", "block");
				$('#video1').attr('src',"files/" + frame_list[0]['frame_filename']);
				setTimeout(function(){ video1.load;	video1.play(); video1.pause(); }, 1000);
				jpeg_mode = true;
			} else {
				$('#image1').css("display", "block");
				$('#video1').css("display", "none");
				jpeg_mode = false;
			}
		}
	}
	xmlhttp.open("GET", framesUrl, true);
	xmlhttp.send();
}

function enterFeed(feedName) {
	if(currentFeed != '') {
		feedUnSelect(currentFeed);
	} else {
		$('#loading_frameimage').css("display", "block");
	}
	feedSelect(feedName);

	currentFeed = feedName;

	printDateDropdown(feedName);
	updateTimeline();
}

function feedSelect(feedName) {
	td = document.getElementById(feedName);
	td.className = 'feedSelect';
}

function feedUnSelect(feedName) {
	td = document.getElementById(feedName);
	td.className = 'feedUnSelect';
}

var saved_time_selection=0;

function tl_move(e) {
	if (document.layers) {
		rx = e.pageX;
		rx = rx - document.getElementById('timeline').x;
	}
	else {
		if (document.all) {
			rx = event.clientX + document.body.scrollLeft;
		} else {
			rx = e.clientX + document.body.scrollLeft;
		}
		iPos = 0; elt = document.getElementById('timeline');
		while (elt != null) {
			iPos += elt.offsetLeft;
			elt = elt.offsetParent;
		}
	}
	rx = rx - iPos;

	saved_time_selection_pre=parseInt(rx * (86400/(document.getElementById('timeline').width-2)));
	saved_time_selection=getFrameNearestToSeconds(saved_time_selection_pre);

	// get the time from the current frame (in seconds from midnight) - convert into hh mm ss and subframe number
	currentFrameFullSeconds = frame_list[Number(saved_time_selection)]['frame_seconds'];
	currentFrameIndex = frame_list[Number(frame)]['subframe_index'];
	currentFrameHours = Math.floor(currentFrameFullSeconds / 3600);
	currentFrameHours_remainder = currentFrameFullSeconds%3600;
	currentFrameMins = Math.floor(currentFrameHours_remainder / 60);
	currentFrameSeconds = currentFrameHours_remainder%60;

	// pad with zeros
	currentFrameHours = ("0" + currentFrameHours).slice (-2);
	currentFrameMins = ("0" + currentFrameMins).slice (-2);
	currentFrameSeconds = ("0" + currentFrameSeconds).slice (-2);
	currentFrameIndex = ("0" + currentFrameIndex).slice (-2);

	// update document
	$('#frameTime_HH').attr('value',currentFrameHours);
	$('#frameTime_MM').attr('value',currentFrameMins);
	$('#frameTime_SS').attr('value',currentFrameSeconds);
	$('#frameTime_FF').attr('value',currentFrameIndex);

	return false;
}

function tl_out() {
  updateUIPositionInfo();
}

function tl_click() {
  frame = Number(saved_time_selection);
  updateUIPositionInfo();
  loadNextFrame(PLAYSTATE_RESET);
} 












