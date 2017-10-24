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
ini_set("display_errors", 1);
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

if(isset($feed, $date)) {
	$path_to_images = "$image_root/$feed/$date";
	$path_to_imagelist = "$image_root/$feed/$date.frames";
}

if(!isset($path_to_images)) {
    die('Feed and Date not defined');
}

$filePattern = "/[0-9]\.(jpg|jpeg|gif|png)$/i";
$regs=[]; // for storing regex matches

// attempt to read the frame list first - if not try and fall back to listing the directory of jpegs
$filenames = array();
$using_jpeg_files = false;
$ogv_exists = file_exists ( "$path_to_images" . ".ogv" );
$mp4_exists = file_exists ( "$path_to_images" . ".mp4" );
$path_to_videofile_relative_to_www = $ogv_exists ? "$feed/$date.ogv" : "$feed/$date.mp4";
if( file_exists ( "$path_to_imagelist" ) and ( $ogv_exists or $mp4_exists ) ) {
	$using_jpeg_files = false;
	$file = new SplFileObject("$path_to_imagelist");
	while (!$file->eof()) {
		$file_name = trim(preg_replace('/\s+/', '', $file->fgets()));
		if (preg_match($filePattern, $file_name)) {
			if(preg_match('/([0-9]{2})([0-9]{2})([0-9]{2})/', $file_name, $regs)) {
				$filenames[$file_name] = $file_name;
			}
		}
	}
	$file = null;
} elseif ( file_exists ( "$path_to_images" ) ) {
	$using_jpeg_files = true;
	$dh = opendir( "$path_to_images" );
	while( $file_name = readdir( $dh ) ) {
		// look for these file types....
		if (preg_match($filePattern, $file_name)) {
			if(preg_match('/([0-9]{2})([0-9]{2})([0-9]{2})/', $file_name, $regs)) {
				$filenames[$file_name] = $file_name;
			}
  		}
	}
} else {
	die( "Cannot find frames in list or folder containing frames " . $path_to_images . " " . $path_to_imagelist );
}

sort($filenames);

$frames = array();
$current_frame_number = 0;
foreach($filenames as $currentFile) {
	$current_frame_number++;
	preg_match('/([0-9]{2})([0-9]{2})([0-9]{2})([-])([0-9]{2})/', $currentFile, $regs);
	$frame_time = $regs[1]*60*60 + $regs[2]*60 + $regs[3];
	$subframe_index=$regs[5];
	if( $using_jpeg_files ) {
		$frame_filepath = $feed . "/" . $date . "/" . $currentFile;
		$frame_filehash = base64_encode(mcrypt_encrypt(MCRYPT_RIJNDAEL_256, md5($secret_key), $frame_filepath, MCRYPT_MODE_CBC, md5(md5($secret_key))));
	} else {
		$frame_filehash = "video";
	}
	$frameinfo = array(
		"frame_index" => $current_frame_number, 
		"frame_filename" => $using_jpeg_files ? $currentFile : $path_to_videofile_relative_to_www,
		"frame_seconds" => $frame_time, 
		"subframe_index" => $subframe_index,
		"frame_filehash" => $frame_filehash
	);
	$frames[] = $frameinfo;
}

echo json_encode($frames);
