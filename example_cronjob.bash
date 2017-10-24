#!/bin/bash
# prevent concurrent execution
[[ $(pgrep -c "`basename \"$0\"`") -gt 1 ]] && exit
# THIS SCRIPT IS DESIGNED TO BE RUN HOURLY
# It will check for the existence of a folder of frames for yesterdays
# cctv footage - if the folder exists it will create a video and a frames list file 
# for the web frontend to use then purge the original jpeg folder
#
# after that it will check how much free space is availible on the cctv partition
# if it is below set threshold videos will be deleted until enougth free space 
# is availible again

# Settings
# The root cctv folder
CCTV_FOLDER="/mnt/cctv"
# A space delimted list of parent folders the cctv images are stored in / camera names
CAM_NAMES="front_door drive gate"
# for the cleanup process - the minimum amount of free space before a video needs deleting
MIN_FREE_SPACE_GB="10"

# Desired Extension - support ogv or mp4 (case sensitive) 
VID_EXT="mp4"
VID_QUALITY="7"

# Helper functions
function getFolderFrameCount() {
	find "$1/" -name "*.jpg" | wc -l
}

# Begin the process

# Currentley this script is only interested in yesterday but could be changed
YESTERDAY="$(date +"%Y%m%d" --date="YESTERDAY")"
DAILYFOLDERS="$YESTERDAY"

# create a list of the full paths to each target folder
TARGET_FOLDERS=""
for CAM_FOLDER in $CAM_NAMES; do
	# before adding folder to target folders list check that it exists and contains jpg files
	POTENTIAL_TARGET="$CCTV_FOLDER/$CAM_FOLDER/$YESTERDAY"
	if [ ! "$(find "$POTENTIAL_TARGET" -name "*.jpg" 2>/dev/null | head -n1)" == "" ]; then
	       	echo "Found folder to create video from $POTENTIAL_TARGET"	
		TARGET_FOLDERS="$POTENTIAL_TARGET $TARGET_FOLDERS"
	fi
done


# Go through target folders found create the video then destroy the jpeg folder
for TARGET_FOLDER in $TARGET_FOLDERS; do
	echo "Creating video $TARGET_FOLDER.$VID_EXT"
	find "$TARGET_FOLDER" -name "*.jpg" | sort | xargs cat | nice -n 19 ffmpeg -v error -i - -q:v $VID_QUALITY -y "$TARGET_FOLDER.$VID_EXT"
	if [ -f "$TARGET_FOLDER.$VID_EXT" ]; then
		echo "Video created storing frames list and purging $TARGET_FOLDER"
		find "$TARGET_FOLDER" -name "*.jpg" -printf "%f\n" | sort > "$TARGET_FOLDER".frames
		rm -Rf "$TARGET_FOLDER"
		chmod a+r "$TARGET_FOLDER.$VID_EXT"
	fi
done




# ---------------------------------------
# CLEANUP

# determine if disk space needs freeing / how much
function getSpaceToClear() {
	FREE_SPACE_KB=$(df "$CCTV_FOLDER" | awk '/[0-9]%/{print $(NF-2)}')
	MIN_FREE_SPACE_KB=$(echo "scale=2; $MIN_FREE_SPACE_GB * 1000000" | bc)
	SPACE_TO_FREE=$(echo "$MIN_FREE_SPACE_KB - $FREE_SPACE_KB" | bc)
	echo -n $SPACE_TO_FREE
}

# runs loop if not enougth free space - deletes oldest found video until there is enougth space
while [ "$(getSpaceToClear)" -gt 0 ]; do
	echo "Free space low - Need to clean $(getSpaceToClear) GB from drive"
	for CAM_FOLDER in $CAM_NAMES; do
		FILE_TO_REMOVE=$(find "$CCTV_FOLDER/$CAM_FOLDER" -type f -name "*.mp4" | sort | head -n 1)
		FRAMES_TO_REMOVE="$(echo "$FILE_TO_REMOVE" | sed 's/mp4/frames/g')"
		echo "Deleting $FILE_TO_REMOVE and $FRAMES_TO_REMOVE"
		rm "$FILE_TO_REMOVE" "$FRAMES_TO_REMOVE"
	done
done
