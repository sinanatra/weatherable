#!/bin/bash

# Directory containing the videos
input_dir="hd"
output_dir="video"

# Create the output directory if it doesn't exist
mkdir -p "$output_dir"

# Loop over all video files in the input directory
for input_file in "$input_dir"/*; do
    # Extract the file name without the extension
    filename=$(basename "$input_file")
    
    # Define the output file path
    output_file="$output_dir/compressed_$filename"
    
    # Compress the video using H.264 codec and a reasonable CRF
    ffmpeg -i "$input_file" -vcodec libx264 -crf 23 -preset slow -acodec aac -b:a 128k "$output_file"
    
    echo "Compressed $input_file -> $output_file"
done
