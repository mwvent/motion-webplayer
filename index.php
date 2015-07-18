<html>
<!--
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
...-->
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=windows-1252">
  <link rel="stylesheet" type="text/css" href="style.css">
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
  <script language="JavaScript" type="text/javascript" src="player.js"></script>
  <title>motion-webplayer</title>
</head>
  
<body>
  <div id='header'>
    <span id='feedbuttons_container'>
    </span>
    <span id='datePicker_container'>
      <select id="txtFeedDate" name="txtFeedDate">
	<option disabled selected>--select a date--</option>
      </select>
    </span>
  </div>
  <div id='frames_container'>
    <span></span>
    <img src=images/nofeed.gif id='image1' style='display:none'>
    <img id='loading_frameimage' src=''>
    <span></span>
  </div>
  <div id='footer_container'>
    <div id='progress_container'>
      <img src=timeline.php id='timeline' onMouseMove="return tl_move(event);" onMouseOut="return tl_out();" onClick="return tl_click();">
      <progress id='progress-bar' min='0' max='100' value='50'>0% played</progress>
    </div>
    <div id='player_controls_container'>
      <span></span>
      <img src="images/rewind.gif" onClick="loadNextFrame(PLAYSTATE_STEP_START);" alt="|<" title="Rewind to start of day">
      <img src="images/stepback.gif" onClick="loadNextFrame(PLAYSTATE_STEP_BACKWARDS);" alt="<|" title="Go back one frame">
      <img src="images/playback.gif" onClick="loadNextFrame(PLAYSTATE_PLAY_BACKWARDS);" alt="<" title="Play backwards">
      <img src="images/stop.gif" onClick="loadNextFrame(PLAYSTATE_STOPPED);" alt="||" title="Stop playing">
      <img src="images/playfrwd.gif" onClick="loadNextFrame(PLAYSTATE_PLAY_FORWARDS);" alt=">" title="Play forwards">
      <img src="images/stepfrwd.gif" onClick="loadNextFrame(PLAYSTATE_STEP_FORWARDS);" alt="|>" title="Go forward one frame">
      <img src="images/playend.gif" onClick="loadNextFrame(PLAYSTATE_STEP_END);" alt=">|" title="Go forward to end of day">
      <span id='timeText_container'>
	<input type="text" size="2" maxlength="2" value="00" id="frameTime_HH">:
	<input type="text" size="2" maxlength="2" value="00" id="frameTime_MM">:
	<input type="text" size="2" maxlength="2" value="00" id="frameTime_SS">-
	<input type="text" size="2" maxlength="2" value="00" id="frameTime_FF">
      </span>
      <span></span>
    </div>
  </div>
</body>
</html>
