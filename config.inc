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


/*
	Motion settings:
	All cameras must log jpeg images into directories with date with format %Y%m%d and
	with a filename start with %H%M%S e.g.
	jpeg_filename cam%t/%Y%m%d/%H%M%S-%q

	All cameras must also be configured to have a separate diretory e.g. following structure

	cam1/
		20070820/
			100820-00.jpg
			100820-01.jpg
		20070821/
			110902-00.jpg
	cam2/
		20070820/
			110820-00.jpg
		20070821/

	image_root below must point to the root of the cameras directory.

	In php.ini you have to leave open_basedir empty or have your camera directory base e.g.
	open_basedir = /home/:/tmp/:/usr/share/pear/:/motioncaps/
	You also have to add gd support to php e.g.
	extension=gd.so
*/


$mode='browser';

// Don't end image_root path with /
$image_root = "/home/www/cams/history/feeds";
// DOnt forget to setup mcrypt http://us.php.net/manual/en/mcrypt.installation.php
$secret_key = "daspdjp321p4u123rnsadsnpdsao";