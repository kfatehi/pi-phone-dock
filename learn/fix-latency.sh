#!/bin/bash

# I had an audio chopppy/skippy issue
# I learned from here about latency offsets
# https://askubuntu.com/questions/475987/a2dp-on-pulseaudio-terrible-choppy-skipping-audio
# But it turned out this was the fix for me:

pactl set-port-latency-offset bluez_card.DC_52_85_E1_60_48 phone-output 0
sudo systemctl restart bluetooth
