<?php
/*
  Returns a JSON encoded list of frames and their times recorded
*/
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

if(!isset($_GET['frame'])) {
  $frame = 0;
} else {
  $frame = (int)trim($_GET['frame']);
}

if(isset($_GET['feed'])) {
      $feed = trim($_GET['feed']);
} else {
      die("No Feed");
}	

if(isset($_GET['date'])) {
      $date = trim($_GET['date']);
} else {
      die("No Date");
}

if(isset($feed, $date))
{
  $path_to_images = "$image_root/$feed/$date/";
}

if(!isset($path_to_images)) {
    die('Feed and Date not defined');
}

$filePattern = "/[0-9]\.(jpg|jpeg|gif|png)$/i";

$dh = opendir( "$path_to_images" );
$filenames = array();
while( $file_name = readdir( $dh ) ) {
  // look for these file types....
  if (preg_match($filePattern, $file_name)) {
    if(ereg('([0-9]{2})([0-9]{2})([0-9]{2})', $file_name, $regs)) {
      $filenames[] = $file_name;
    }
  }
}

sort($filenames);

$frames = array();
$current_frame_number = 0;
foreach($filenames as $currentFile) {
  $current_frame_number++;
  ereg('([0-9]{2})([0-9]{2})([0-9]{2})([-])([0-9]{2})', $currentFile, $regs);
  $frame_time = $regs[1]*60*60 + $regs[2]*60 + $regs[3];
  $subframe_index=$regs[5];
  $frame_filepath = $feed . "/" . $date . "/" . $currentFile;
  $frame_filehash = base64_encode(mcrypt_encrypt(MCRYPT_RIJNDAEL_256, md5($secret_key), $frame_filepath, MCRYPT_MODE_CBC, md5(md5($secret_key))));
  $frameinfo = array(
    "frame_index" => $current_frame_number, 
    "frame_filename" => $currentFile, 
    "frame_seconds" => $frame_time, 
    "subframe_index" => $subframe_index,
    "frame_filehash" => $frame_filehash
  );
  $frames[] = $frameinfo;
}

echo json_encode($frames);