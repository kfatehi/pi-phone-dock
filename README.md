# Hacker Phone Dock

Apple doesn't allow you to access the audio streams of standard calls on your iPhone via API, that's why you don't see any proper call recording apps, only bullshit "workarounds" that do not work and presumably lead you to installing malware.

There is only one way to access these audio streams, and it is to tap the streams after establishing a bluetooth hands free profile with another device (in our case, the Raspberry Pi). Apple has gone to great lengths to ensure this experience works well for all apps, as our telecommunications is balkanized amongst many apps these days (Zoom, Discord, FaceTime, and the standard phone call). Good apps implement Apple's CallKit API which transparently adds correct support for the bluetooth experience.

Using this technique, we unlock the ability to activate special features. The flagship feature which gave rise to this project is the realtime translation capability. Many telephony features are available thanks to the ofono project such as calling, texting, and other things you expect when you pair your phone to your car.

### Hardware

Tested with a Raspberry Pi 4 with a USB BCM20702A0 Bluetooth Module. According to [phony's hardware section](https://github.com/littlecraft/phony#appendix-a-hardware), the internal bluetooth module cannot be configured in Hands Free mode, and so I did not attempt it.

For headset support, I recommend [USB Audio Adapter](https://www.amazon.com/Sabrent-External-Adapter-Windows-AU-MMSA/dp/B00IRVQ0F8) which I will soon test myself. See [phony's hardware section](https://github.com/littlecraft/phony#appendix-a-hardware), a similar project with similar hardware constraints.

You could try using a bluetooth headset paired to the Pi, but not all work. For example, the Samsung Galaxy Buds can receive sound just fine, but [they will not transmit sound over the microphone](https://www.reddit.com/r/galaxybuds/comments/g4so4t/using_the_microphone_on_ubuntu_1804/). An unsolved mystery not worth solving.

The permanent configuration I've gone with is rather more complex and integrates my SteelSeries Arctis 7 headset via my Windows computer monitoring over the standard sound card ports which are cross-linked into the USB adapter linked above. Works a charm and makes the Pi Dock a permanent part of the system. This also works great for being able to record calls and demos using OBS from Windows since the audio interfaces are made available for further tapping!

### Software

The Pi system requires pulseaudio and is heavily integrated with it. Some applications may have their own additional requirements. I honestly lost track of what the install notes are, so we need to flesh those instructions out on the next build.

## Realtime Translation

This application (which is far from perfect, but is a working proof of concept) gave rise to this project. Find it in the demos folder. 

### Connectivity Requirements

Unfortunately, the realtime translation system uses the internet for a few things.

- Translation is using Google Translate. See issue [#2](/../../issues/2) for a promising replacement.
- Synthesizing Farsi speech from Farsi text is using a personal web service hosted by me which wraps the only decent and attainable Farsi speech synthesizer I could find after [a lot of digging](https://github.com/kfatehi/visual-translator/issues/2).

 I very much want to remove these so this can become a viable travel tool. That said, the telecommunications nature of this project does imply that you, as the user, are remote with access to telephony and so you can likely be online. Of course the problem is not so much the fact that you need internet, but the fact that these services we depend on could be pulled out from under you at any time.