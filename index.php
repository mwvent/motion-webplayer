<?php
/*
  This file is part of motion-webplayer
  motion-webplayer is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License version 2as published by
  the Free Software Foundation
  
  motion-webplayer is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with motion-webplayer.  If not, see <http://www.gnu.org/licenses/>.
  
  Contains portions of code from Dag Erlandsson (langarod@gmail.com) - http://www.lavrsen.dk/foswiki/bin/view/Motion/MotionJpegViewer
  
  Author: Matthew Watts 2015
*/

  include("config.inc");
  if(!isset($_GET['delay'])) {
	$delay = 100;
  } else {
  	$delay = (int)$_GET['delay'];
  }
  if($delay < 10 || $delay > 10000)
    $delay = 100;

  if(!isset($_GET['step'])) {
    $frameStep = 1;
  } else {
  	$frameStep = (int)$_GET['step'];
  }
  if($frameStep < 1 || $frameStep > 10)
    $frameStep = 1;

  if(!is_dir($image_root))
  {
    echo "$image_root isn't a directory! Please check config.php\n";
  }

  $dh = opendir( $image_root );
  if($dh == FALSE)
  {
    echo "Unable to open directory $image_root\n";
  }
  else
    closedir($dh);
?>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=windows-1252">
    <link rel="stylesheet" type="text/css" href="style.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
    <script language="JavaScript" type="text/javascript">
    var feeds = new Array();
    <?php
      $feednames = array();
      $dh = opendir( $image_root );
      while( $file = readdir( $dh ) )
      {
	if($file == '.' | $file == '..' | $file == 'lost+found')
	  continue;
	if(is_dir("$image_root/$file") )
	  $feednames[] = $file;
      }
      sort($feednames);

      foreach($feednames as $key => $feedName)
      {
	echo "feeds[$key] = ['$feedName'";

	$feedDates = array();
	$dh = opendir( "$image_root/$feedName" );
	while( $file = readdir( $dh ) )
	{
	  if($file == '.' | $file == '..' | $file== 'lost+found')
	    continue;
	  if(is_dir("$image_root/$feedName/$file") )
	    $feedDates[] = $file;
	}
	sort($feedDates);
	
	foreach($feedDates as $key => $feedDate)
	{
	  echo ",'$feedDate'";
	}
	echo "];\n";
      }
    ?>
    </script>
    <script language="JavaScript" type="text/javascript" src="player.js"></script>
    <title>Historical viewer</title>
  </head>
  <body>
  <table>
    <tr>
      <td colspan=6>
	<table border="1">
	  <tr>
	  <script language="JavaScript" type="text/javascript">
	    printFeeds();
	  </script>
	  <td>
	    <select id="txtFeedDate" name="txtFeedDate">
	      <option>Empty</option>
	    </select> 
	    <input type="text" size="4" value="00:00" id="textTime">
	    <input type="text" size="4" value="" id="textFrame">
	  </td>
	  </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td colspan=6>
	<img src=images/nofeed.gif id='image1' style='height: 90%;'>
      </td>
    </tr>
    <tr>
      <td style='position: relative; height: 26px; min-height: 26px;' colspan=6>
        <img src=timeline.php id='timeline' onMouseMove="return tl_move(event);" onMouseOut="return tl_out();" onClick="return tl_click();" style="height:25px; width:100%; position: absolute; top: 0; z-index: 9010;">
	<progress id='progress-bar' min='0' max='100' value='50' 
	style='width: 100%; position: absolute; top: 0; height: 25px; display: block; z-index: 9000;'>0% played</progress>
      </td>
    </tr>
    <tr>
      <td><img src="images/rewind.gif" width="24" height="24" onClick="playbackAction('first');" alt="|<" title="Rewind to start of day" style="cursor: pointer"></td>
      <td><img src="images/stepback.gif" width="24" height="24" onClick="playbackAction('bstep');" alt="<|" title="Go back one frame" style="cursor: pointer"></td>
      <td><img src="images/playback.gif" width="24" height="24" onClick="playbackAction('bplay');" alt="<" title="Play backwards" style="cursor: pointer"></td>
      <td><img src="images/stop.gif" width="24" height="24" onClick="playbackAction('stop');" alt="||" title="Stop playing" style="cursor: pointer"></td>
      <td><img src="images/playfrwd.gif" width="24" height="24" onClick="playbackAction('play');" alt=">" title="Play forwards" style="cursor: pointer"></td>
      <td><img src="images/stepfrwd.gif" width="24" height="24" onClick="playbackAction('step');" alt="|>" title="Go forward one frame" style="cursor: pointer"></td>
      <td><img src="images/playend.gif" width="24" height="24" onClick="playbackAction('last');" alt=">|" title="Go forward to end of day" style="cursor: pointer"></td>
    </tr>
  </table>
</body>
</html>
