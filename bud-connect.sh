#!/bin/bash
cat <<EOF | bluetoothctl
select 5C:F3:70:68:B6:9A
connect D8:55:75:B9:5C:72
EOF
