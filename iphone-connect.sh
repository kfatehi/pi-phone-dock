#!/bin/bash
cat <<EOF | bluetoothctl
select 5C:F3:70:6A:0E:4D
connect DC:52:85:E1:60:48
EOF
