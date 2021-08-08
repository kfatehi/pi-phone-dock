#!/bin/bash
# Based on the last example in Ahmad's reply here
# https://askubuntu.com/questions/1260805/how-can-i-record-the-audio-output-using-sox
# We can run this script to start recording from the BT AG device (the person speaking)
# and record to a file, ending when there is 3 seconds of silence.
PSOURCE=${PSOURCE:-'bluez_source.DC_52_85_E1_60_48.headset_audio_gateway'}
OUTFILE=${OUTFILE:-'test.ogg'}

parec -d $PSOURCE | sox -t raw -b 16 -e signed -c 2 -r 44100 - $OUTFILE silence 1 0.1 3% 1 3.0 3%
