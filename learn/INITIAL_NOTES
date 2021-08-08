

This gets pretty close to what I want

https://github.com/littlecraft/phony

And has an especially useful README for the build instructions of Ofono.
 
Nice bluetooth stuff from archwiki of course https://wiki.archlinux.org/title/bluetooth_headset#Headset_via_Bluez5/PulseAudio

Not sure if we will need to build pulseaudio but we might

I dont know if we'll need to bother building ofono either, it exists in

the apt repos.

FRankly all we need to be able to do is pipe our audio input 

into some kind of environment in which we wil be able to process it.

Something more akin to the tricks we see here

https://unix.stackexchange.com/questions/576785/redirecting-pulseaudio-sink-to-a-virtual-source

Now, since I can listen to music and such, that's great, but I think we do need ofono, so our phone is acting as a HFP, not just A2DP.

apt install ofono

That old resource we used on the other pI

https://scribles.net/hfp-on-raspberry-pi/

Now I did edit the pulseaudio default conf and have issues, but it did make HFP "work"

--- 

ok we get no audio when mute. intelligent debug path here:

https://bugs.freedesktop.org/show_bug.cgi?id=97064

also getting mad buffer underruns (syslog)

do we REALLY need two BT adapters? because I suspect there might be interference between them being so close?

Also we should probably turn off the internal bluetooth and wifi chips.

-------

After switching to a non galaxy bud headset, and with the BCM2070 firmeware, we are in a good position to build something.

after installing sox we have the ability to now record from the default audio device
