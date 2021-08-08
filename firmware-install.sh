#!/bin/bash
# Got the firmware file from https://github.com/littlecraft/phony/blob/master/firmware/bcm20702a0/BCM20702A1-0a5c-21e8.hcd
# Got the knowledge of needing to install it and where from https://bugs.freedesktop.org/show_bug.cgi?id=97064#c21

SRC=BCM20702A1-0a5c-21e8.hcd
DEST=/lib/firmware/brcm/BCM20702A1-0a5c-21e8.hcd

if [[ ! -f $SRC ]]; then
  echo "missing"
  exit 1
fi
  

if [[ ! -f $DEST ]]; then
  cp $SRC $DEST
else
  echo "Already installed"
fi
  
