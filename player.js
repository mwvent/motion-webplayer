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
  $('#feedbuttons_container').on('click', '.feedUnSelect', function() {
    enterFeed($(this).data("feed"));
  });
});

function loadNextFrame(newPlayState) {
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
      if( (frame + frameStep) < frame_list.length ) {
	frame+=frameStep;
      } else {
	playState=PLAYSTATE_STOPPED;
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
    var fileHash = frame_list[Number(frame)]['frame_filehash'];
    imgUrl = 'getframe.php?frame=' + encodeURIComponent(fileHash);
    img = document.getElementById('image1');
    img.src = imgUrl;
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

function printDateDropdown(feedName)
{
  dl = document.getElementById('txtFeedDate');
  
  if (typeof dl.options[dl.selectedIndex].value !== 'undefined') {
    oldFeedDate = dl.options[dl.selectedIndex].value;
  } else {
    oldFeedDate = '';
  }

  for(i = dl.options.length-1; i>=0; i--)
    dl.options[i] = null;

  selected = false;
  for(fi = 0; fi < feeds.length; fi++)
  {
    if(feeds[fi][0] == feedName)
    {
      for(di = 1; di < feeds[fi].length; di++)
      {
	dl.options[di-1] = new Option(feeds[fi][di]);
	dl.options[di-1].value = feeds[fi][di];
	if(feeds[fi][di] == oldFeedDate)
	{
	  dl.options[di-1].selected = true;
	  selected = true;
	}
      }
      if(selected == false)
	dl.options[dl.options.length-1].selected=true; // select last item in list
	dateClick();
    }
  }
}

function dateClick()
{
  updateTimeline();
}

function updateTimeline()
{
  $('#footer_container').css("display", "none");
  $('#loading_frameimage').css("display", "block");
  $('#image1').css("display", "none");
  frame=-1;
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
	  $('#image1').css("display", "block");
      }
  }
  xmlhttp.open("GET", framesUrl, true);
  xmlhttp.send();
}

function enterFeed(feedName)
{
  if(currentFeed != '') {
    feedUnSelect(currentFeed);
  } else {
    $('#loading_frameimage').attr('src','images/loading_spinner.gif');
  }
  feedSelect(feedName);

  currentFeed = feedName;

  printDateDropdown(feedName);
  updateTimeline();
}

function feedSelect(feedName)
{
  td = document.getElementById(feedName);
  td.className = 'feedSelect';
}

function feedUnSelect(feedName)
{
  td = document.getElementById(feedName);
  td.className = 'feedUnSelect';
}

var saved_time_selection=0;

function tl_move(e)
{
  if (document.layers) 
  {
    rx = e.pageX;
    rx = rx - document.getElementById('timeline').x;
  }
  else
  {
    if (document.all) 
      rx = event.clientX + document.body.scrollLeft;
    else
      rx = e.clientX + document.body.scrollLeft;

    iPos = 0; elt = document.getElementById('timeline');
    while (elt != null)  
    {
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

function tl_out()
{
  updateUIPositionInfo();
}

function tl_click()
{
  frame = Number(saved_time_selection);
  updateUIPositionInfo();
  loadNextFrame(PLAYSTATE_RESET);
} 
