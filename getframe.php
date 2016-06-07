<?php
/*
  Takes a hashed file path, loads a jpeg image, recompresses it and sends to client
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

if(isset($_GET['frame'])) {
  // decrypt the file path
  $file=rtrim(mcrypt_decrypt(MCRYPT_RIJNDAEL_256, md5($secret_key), base64_decode($_GET['frame']), MCRYPT_MODE_CBC, md5(md5($secret_key))), "\0");
  $filename = trim($image_root . "/" . $file);
  // TODO hashing is not immutable - check for directory traversal attack - file must be a child of $image_root
} else {
  $filename = "throw an error";
}

if(isset($_GET['q'])) {
	$quality = $_GET['q'];
	//if( ! is_int($quality) ) {
	//	$quality = 70;
	//}
	if( $quality < 2 ) {
		$quality = 2;
	}
	if( $quality > 100 ) {
		$quality = 100;
	}
} else {
	$quality = 70;
}

// create image object from jpeg files - this allows us to recompress the jpeg and also helps
// prevent attacks that attempt to retrive another type of file from the filesystem
// @ to prevent image loading errors destroying JPEG data
$source = @imagecreatefromjpeg(trim($filename));

// JPEG Loading error handler
if(!$source) {
  /* Create a black image */
  $source  = imagecreatetruecolor(150, 30);
  $bgc = imagecolorallocate($source, 255, 255, 255);
  $tc  = imagecolorallocate($source, 0, 0, 0);

  imagefilledrectangle($source, 0, 0, 150, 30, $bgc);

  /* Output an error message */
  imagestring($source, 1, 5, 5, 'Error loading frame', $tc);
}

header("Content-type: image/jpeg\n\n");
imagejpeg($source, NULL, $quality);
