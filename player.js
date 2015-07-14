var image_obk = new Image;
var frame=0;
var frameStep = 1;
var startTime = '00:00:00';
var playState = 0;
var liveView = false;
var currentFeed = '';
var feeds = new Array();
var frame_list;

$( document ).ready(function() {
  updateFeedsList();
  $("#image1").load(function() {
    setTimeout(function() {
      onNewFrame();
    }, 1);
  });
  $("#txtFeedDate").change(function() {
    dateClick();
  });
});

function updateFeedsList() {
  $.ajax({
    url: "feedlist.php",
    dataType: "json",
    success: function(data) {
      feeds=data;
      var feedsHTML = "";
      for (currentFeedIndex in feeds) {
	feedsHTML += "<span id='" + feeds[currentFeedIndex][0] + 
		"' class='feedUnSelect' onClick=\"enterFeed('" + feeds[currentFeedIndex][0] + "')\">" +
		feeds[currentFeedIndex][0] + "</span>";
      }
      destDiv = document.getElementById('feedbuttons_div');
      destDiv.innerHTML = feedsHTML;
    },
    error: function (request, status, error) {
      alert(request.responseText);
    }
  });
}

function updateProgressBar() {
  var progressBar = document.getElementById('progress-bar');
  progressBar.max = 24 * 60 * 60; // seconds in a day
  if(startTime != '')
  {
    startTime_frameindex = getFrameFromStartTime(startTime);
  } else {
    startTime_frameindex = 0;
  }
  targetFrame = Number(frame) + Number(startTime_frameindex);
  if(targetFrame > frame_list.length) {
    targetFrame = frame_list.length;
  }
  if(targetFrame < 0) {
    targetFrame = 0;
  }
  progressBar.value = Number(frame_list[targetFrame]['frame_seconds']);
}

function onNewFrame() {
  updateProgressBar();
  switch(playState) {
    case 0: // stopped - no next frame to load
      break;
    case 2: // playing forwards
      if( (targetFrame + 1) < frame_list.length ) {
	frame+=frameStep;
	playbackAction('play');
      }
      break;
    case -2: // playing backwards
      if( (targetFrame - 1) > -1 ) {
	frame-=frameStep;
	playbackAction('bplay');
      }
      break;
    case 1: // step forward one frame & stop
      if( (targetFrame + 1) < frame_list.length ) {
	frame+=frameStep;
	playState = 0;
      }
      break;
    case -1: // step backwards one frame & stop
      if( (targetFrame - 1) > -1 ) {
	frame-=frameStep;
	playState = 0;
      }
      break;
  }
  updateFrameTimeAndIndexTextBoxes();
}

function updateFrameTimeAndIndexTextBoxes() {
  // convert frame Number to hh:mm:ss & frame number
  currentFrame = Number(frame) + Number(startTime_frameindex);
  currentFrameFullSeconds = frame_list[Number(frame) + Number(startTime_frameindex)]['frame_seconds'];
  currentFrameIndex = frame_list[Number(frame) + Number(startTime_frameindex)]['subframe_index'];
  currentFrameHours = Math.floor(currentFrameFullSeconds / 3600);
  currentFrameHours_remainder = currentFrameFullSeconds%3600;
  currentFrameMins = Math.floor(currentFrameHours_remainder / 60);
  currentFrameSeconds = currentFrameHours_remainder%60;
  if(currentFrameHours < 10)
    currentFrameHours = '0' + currentFrameHours;
  if(currentFrameMins < 10)
    currentFrameMins = '0' + currentFrameMins;
  if(currentFrameSeconds < 10)
    currentFrameSeconds = '0' + currentFrameSeconds;
  document.getElementById('textTime').value = currentFrameHours+":"+currentFrameMins+":"+currentFrameSeconds+"";
  //startTime = currentFrameHours+":"+currentFrameMins+":"+currentFrameSeconds+"";
  document.getElementById('textFrame').value = 0;
  updateProgressBar();
}

function getFrameFromStartTime(startTime) {
  if(startTime[0]=="0") { return 0; }
  var time_parts = startTime[0].split(':');
  startTime_seconds = Number( time_parts[0] * 60 * 60 ) + Number( time_parts[1] * 60 ) + Number(time_parts[2]);
  found_frame = 0;
  for (var i in frame_list) {
    if(frame_list[i]['frame_seconds'] < startTime_seconds) {
      found_frame = i;
    }
  }
  return found_frame;
}

function playbackAction(action) {
  /*
  fd = document.getElementById('txtFeedDate');
  feedDate = fd.options[fd.selectedIndex].value;
  */
  if(startTime != '')
  {
    startTime_frameindex = getFrameFromStartTime(startTime);
  } else {
    startTime_frameindex = 0;
  }
  
  switch(action) {
    case 'play':
      playState = 2;
      break;
    case 'bplay':
      playState = -2;
      break;
    case 'bstep':
      playState = -1;
      break;
    case 'step':
      playState = 1;
      break;
    case 'first':
      playState = 0;
      frame = 0;
      startTime_frameindex = 0;
      startTime = document.getElementById('textTime').value;
      // updateFrameTimeAndIndexTextBoxes();
      break;
    case 'last':
      playState = 0;
      frame = frame_list.length -1;
      startTime_frameindex = 0;
      startTime = document.getElementById('textTime').value;
      //updateFrameTimeAndIndexTextBoxes();
      break;
    case 'stop':
      playState = 0;
      break;
  }
  var fileHash = frame_list[Number(frame) + Number(startTime_frameindex)]['frame_filehash'];
  imgUrl = 'getframe.php?frame=' + encodeURIComponent(fileHash);
  updateFrameTimeAndIndexTextBoxes();
  img = document.getElementById('image1');
  img.src = imgUrl;
}

function setFrame(newFrame, force) // see force as a default parameter with false
{          
  newFrame = parseInt(newFrame);
  if(frame != newFrame || force!=null) {
    frame = newFrame;
    updateFrameTimeAndIndexTextBoxes();
    playbackAction('stop');
  }
}

function printFeeds()
{
  
}

function printDateDropdown(feedName)
{
  dl = document.getElementById('txtFeedDate');
  oldFeedDate = dl.options[dl.selectedIndex].value;

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
	  document.getElementById('timeline').src = timeUrl;
	  setFrame(0, true);
      }
  }
  xmlhttp.open("GET", framesUrl, true);
  xmlhttp.send();
}

function enterFeed(feedName)
{
  if(currentFeed != '')
    feedUnSelect(currentFeed);
  feedSelect(feedName);

  currentFeed = feedName;

  printDateDropdown(feedName);
  setFrame(0, true)
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

function onKeyPressOnlyNumber(e)
{
  if(e && e.which)
    c = e.which;
  else
    c = e.keyCode;

  if( c == 13 || c == 8 || c == 37 || c == 39 || c == 35 || c == 36 || c == 46 || c ==9) // delete, home, end etc.
    return true;
  if(c < 48 || c > 57)
    return false;
  return true;
}
function stopOnKeyEnter(e)
{
  if(e && e.which)
    c = e.which;
  else
    c = e.keyCode;

  if(c == 13)
    playbackAction('stop');
}

function setTime(newTime, force)
{
  newTime = newTime.match(/[0-9]{2}:[0-9]{2}:[0-9]{2}/);
  if((newTime != '' && newTime != startTime) || force == true)
  {
    frame = 0;
    startTime = newTime;
    startTime_frameindex = getFrameFromStartTime(newTime);
    updateFrameTimeAndIndexTextBoxes();
    
    playbackAction('stop');
  }
}

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
  mins=parseInt(rx * (1440/(document.getElementById('timeline').width-2)));
  if (mins < 0) { mins = 0; }
  if (mins > 1439) { mins = 1439; }

  hrs=parseInt(mins / 60);
  mins%=60;

  if(hrs < 10)
    hrs = '0' + hrs;
  if(mins < 10)
    mins = '0' + mins;
  document.getElementById('textTime').value = hrs + ':' + mins + ":00";
  return false;
}

function tl_out()
{
  document.getElementById('textTime').value = startTime;
}

function tl_click()
{
  time = document.getElementById('textTime').value;
  setTime(time);
} 
