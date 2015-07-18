<?php
include("config.inc");
/*
  Returns a JSON encoded list of feeds and subfodlers for each feed
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

  Author: Matthew Watts 2015
*/

$feeds = array(); // the output array which will be a numer of sub arrays listing availible dates for each feed
$excluded_names = array('.', '..', 'lost+found'); // exclude these folders from scan

// iterate through each feed/camera fodler
$directory_handler = opendir( realpath($image_root) );
while( $current_directory = readdir( $directory_handler ) ) {
  $directory_path = realpath($image_root) . "/" . $current_directory;
  if( !in_array($current_directory, $excluded_names, true) && is_dir( $directory_path )) {
    $subdirectory_handler = opendir( realpath($image_root) . "/" .$current_directory );
    $subfolder_list = array();
    $files[] = $current_directory;
    // iterate through each folder in the feed folder
    while( $subdirectory = readdir( $subdirectory_handler  ) ) {
      $subdirectory_path = realpath($image_root) . "/" . $current_directory . "/" . $subdirectory;
      if( !in_array($subdirectory, $excluded_names, true) && is_dir($subdirectory_path)) {
	$subfolder_list[] = $subdirectory;
      }
    }
    sort($subfolder_list);
    array_unshift($subfolder_list, $current_directory);
    $feeds[$current_directory] = $subfolder_list;
  }
}
sort($feeds);

echo json_encode($feeds);