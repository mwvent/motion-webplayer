motion-webplayer

A PHP web player for CCTV archive folders created by Motion (http://www.lavrsen.dk/foswiki/bin/view/Motion/WebHome)

Setup instructions
Ensure your PHP installation has GD and mcrypt enabled
http://php.net/manual/en/image.installation.php
http://us.php.net/manual/en/mcrypt.installation.php

Configure motion each camera in motion to save images in the following format
ROOT_DIR/CAMERA_NAME/YYYYMMDD/HHMMSS-FRAME, to do this set target_dir in your main montion.conf file to the ROOT_DIR and in each thread conf file use jpeg_filename CAMERA_NAME/%Y%m%d/%H%M%S-%q
Ensure your webserver has read access to the root directory and its children, additionaly if you are using open_basedir in your php.ini to restrict the paths PHP has access to ensure the root directory is included ( see http://php.net/manual/en/ini.core.php#ini.open-basedir )

Open motion-webplayer's config.inc and set $image_root to the ROOT_DIR motion saves to and finally set $secret_key to a string of random characters.

Also now supports mp4 files in place of the jpeg folder as long as there is a corresponding file containing a list of the original jpeg filenames so the frame times can be calculated. See example_cronjob for an example of an hourly cron job that cleans up old videos when disk space is running low and creates the video+frames files and clears the original.


motion-webplayer is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License version 2as published by the Free Software Foundation
motion-webplayer  is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with motion-webplayer.  If not, see <http://www.gnu.org/licenses/>.
  
Contains portions of code from Dag Erlandsson (langarod@gmail.com) - http://www.lavrsen.dk/foswiki/bin/view/Motion/MotionJpegViewer
  
Author: Matthew Watts 2017
