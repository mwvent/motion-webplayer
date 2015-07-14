<?php
include("config.inc");

$feednames = array();
$dh = opendir( $image_root );
while( $dir = readdir( $dh ) )
{
  if($dir == '.' | $dir == '..' | $dir == 'lost+found')
    continue;
  if(is_dir("$image_root/$dir") ) {
    $sub_dh = opendir( "$image_root/$dir" );
    $filelist = array();
    $files[] = $dir;
    while( $file = readdir( $sub_dh ) ) {
      if($file == '.' | $file == '..' | $file== 'lost+found')
	continue;
      if(is_dir("$image_root/$dir/$file") )
	$filelist[] = $file;
    }
    sort($filelist);
    array_unshift($filelist, $dir);
    $feednames[$dir] = $filelist;
    
  }
}
sort($feednames);

echo json_encode($feednames);