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

$width = 640;
$height = 25;

$legendFontSize = 2;

$secPerPixel = (60*60*24) / $width;
if(!isset($_GET['feed']) || !isset($_GET['date'])) {
  $feed='';
  $date='';
}  else {
  $feed = trim($_GET['feed']);
  $date = trim($_GET['date']);
}
if($feed!='' && $date!='')
{
  $path_to_images = "$image_root/$feed/$date/";
}

$im = @imagecreatetruecolor($width, $height)
  or die("Cannot Initialize new GD image stream");
//$backgroundColor = imagecolorallocate($im, 255, 255, 255);
imagecolortransparent($im, 0);
//imagefilledrectangle($im, 0, 0, $width-1, $height-1, $backgroundColor);
//$transparency = imagecolorallocatealpha($im, 0, 0, $width-1, $height-1, $backgroundColor);
//imagefill($im, 0, 0, $transparency);
//die();
$footer = 0;
$text_color = imagecolorallocate($im, 0, 0, 0);
$textColor = $text_color;
//die();
/*
imagestring($im, $legendFontSize, 0, $height - $footer,  "00:00", $text_color);
imagestring($im, $legendFontSize, $width/4-(imagefontwidth($legendFontSize)*2.5), $height - $footer,  "06:00", $text_color);
imagestring($im, $legendFontSize, $width/2-(imagefontwidth($legendFontSize)*2.5), $height - $footer,  "12:00", $text_color);
imagestring($im, $legendFontSize, $width/4*3-(imagefontwidth($legendFontSize)*2.5), $height - $footer,  "18:00", $text_color);
imagestring($im, $legendFontSize, $width-(imagefontwidth($legendFontSize)*5), $height - $footer,  "24:00", $text_color);

imagerectangle($im, 0, 0, $width-1, $height - $footer+1, $textColor);

for($i=0; $i<24; $i++)
  imageline($im, ($width/24)*$i, $height-$footer, ($width/24)*$i, $height-$footer+3, $textColor);
*/	
if(isset($path_to_images))
{
  $dh = opendir( "$path_to_images" );
  $filenames = array();
  while( $file = readdir( $dh ) )
  {
    // look for these file types....
    if (preg_match('/[0-9]\.(jpg|jpeg|gif|png)$/i',$file))
    {
      $filenames[] = $file;
    }
  }
  sort($filenames);

      $files = count($filenames);
      $xTime = 0;
      $maxFrames = 0;
      $frame = 0;
      ereg('([0-9]{2})([0-9]{2})([0-9]{2})', $filenames[$frame], $regs);
      $frameTime = $regs[1]*60*60 + $regs[2]*60 + $regs[3];
      for($x = 0; $x < $width; $x++)
      {
	      $xTime+= $secPerPixel;
	      $xFrames[$x] = 0;
	      while($frameTime < $xTime)
	      {
		      $frame++;
		      if($frame >= $files)
			      break;
		      $xFrames[$x]++;
		      if($xFrames[$x] > $maxFrames)
			      $maxFrames = $xFrames[$x];
		      ereg('([0-9]{2})([0-9]{2})([0-9]{2})', $filenames[$frame], $regs);
		      $frameTime = $regs[1]*60*60 + $regs[2]*60 + $regs[3];
	      }
      }

      $lineColor = imagecolorallocate($im, 255, 0, 0);
      for($x = 1; $x < $width; $x++)
      {
	      if($xFrames[$x] > 0)
	      {
		      $y = ($height * $xFrames[$x]) / $maxFrames;
		      imageline($im, $x, $height-$footer, $x, $height - $y - $footer, $lineColor);
	      }
      }
      $text_color = imagecolorallocate($im, 0xaa, 0xaa, 0xaa);
      // imagestring($im, 5, 5, 5,  "$maxFrames $files", $text_color);
}
else
{
      $text_color = imagecolorallocate($im, 0, 0, 0);
      imagestring($im, 5, 5, 5,  "No feed", $text_color);
}


      header("Expires: " . date("r "));               // Date in the past
      header("Last-Modified: " . date("r "));          // always modified
      header("Content-type: image/png\n\n");	
      imagepng($im);

      imagedestroy($im);
?>

