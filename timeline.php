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
ini_set("display_errors", 1);

// setup
$width = 1280;
$height = 25;
$legendFontSize = 2;

$secPerPixel = (60*60*24) / $width;

// check feed and date supplied
if(!isset($_GET['feed']) || !isset($_GET['date'])) {
	$feed='';
	$date='';
} else {
	$feed = trim($_GET['feed']);
	$date = trim($_GET['date']);
}
if($feed!='' && $date!='') {
	$path_to_images = "$image_root/$feed/$date/";
	$path_to_imagelist = "$image_root/$feed/$date.frames";
}

// create image in RAM with transparent BG
$im = @imagecreatetruecolor($width, $height)
	or die("Cannot Initialize new GD image stream");
imagecolortransparent($im, 0);

// Setup textColor
$footer = 0;
$text_color = imagecolorallocate($im, 0, 0, 0);
$textColor = $text_color;

// if feed / date supplied build up an image list in the $filenames array
$filenames = array();
$regs=[]; // tmp array for storing regex matches
if(isset($path_to_images)) {
	// build an array of the image filenames and sort them
	// attempt to read the frame list first - if not try and fall back to listing the directory of jpegs
	if( file_exists ( "$path_to_imagelist" ) ) {
		$file = new SplFileObject("$path_to_imagelist");
		while (!$file->eof()) {
			$filenm = $file->fgets();
			// check if filetype is a supported image - add to array if so
			if (preg_match('/[0-9]\.(jpg|jpeg|gif|png)$/i',$filenm)) {
				$filenames[] = $filenm;
			}
		}
	} elseif ( file_exists ( "$path_to_images" ) ) {
		$directory_handler = opendir( "$path_to_images" );
		while( $file = readdir( $directory_handler ) ) {
			// check if filetype is a supported image - add to array if so
			if (preg_match('/[0-9]\.(jpg|jpeg|gif|png)$/i',$file)) {
				$filenames[] = $file;
			}
		}
	}

	sort($filenames);
	$filecount = count($filenames);

	// goal here is to build up an array, for each pixel of the timelines width increase $xFrames[$x] by the amount of 
	// captured frames found
	$xTime = 0; 
	$maxFrames = 0;
	// get values for first frame before starting loop
	$frame = 0;
	preg_match('/([0-9]{2})([0-9]{2})([0-9]{2})/', $filenames[$frame], $regs);
	$frameTime = $regs[1]*60*60 + $regs[2]*60 + $regs[3];

	for($x = 0; $x < $width; $x++) { // on each x co-ord of timline
		$xTime = $x * $secPerPixel; // the current actual time reached in seconds since midnight
		// loop through any found frames until at a frame time past our current x-cord
		$xFrames[$x] = 0;
		while($frameTime < $xTime) {
			$frame++;
			if($frame >= $filecount) {
				break;
			}
			$xFrames[$x]++;
			// if this is the highest amount of frames found for one x-cord raise the maxFrames value
			if($xFrames[$x] > $maxFrames) {
				$maxFrames = $xFrames[$x];
			}
			// store the frameTime of the next frame
			preg_match('/([0-9]{2})([0-9]{2})([0-9]{2})/', $filenames[$frame], $regs);
			$frameTime = $regs[1]*60*60 + $regs[2]*60 + $regs[3];
		}
	}

	// again loop through each pixel through the width of the timeline, this time drawing a line
	// the more frames found the higher the line
	$lineColor = imagecolorallocate($im, 255, 0, 0);
	for($x = 1; $x < $width; $x++) {
		if($xFrames[$x] > 0) {
			$y = ($height * $xFrames[$x]) / $maxFrames;
			imageline($im, $x, $height-$footer, $x, $height - $y - $footer, $lineColor);
		}
	}
	$text_color = imagecolorallocate($im, 0xaa, 0xaa, 0xaa);
	// imagestring($im, 5, 5, 5,  "$maxFrames $filecount", $text_color);
} else { // if no path to images was given reutrn No feed image
	$text_color = imagecolorallocate($im, 0, 0, 0);
	imagestring($im, 5, 5, 5,  "No feed", $text_color);
}

// return image to browser
header("Expires: " . date("r "));               // Date in the past
header("Last-Modified: " . date("r "));          // always modified
header("Content-type: image/png\n\n");	
imagepng($im);

imagedestroy($im);
?>

