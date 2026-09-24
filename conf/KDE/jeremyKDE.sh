lookandfeeltool -a 'org.kde.breezedark.desktop'

kwriteconfig6 --file "klaunchrc" --group "BusyCursorSettings" --key "Bouncing" false

kwriteconfig6 --file kscreenlockerrc --group Greeter --group Wallpaper --group org.kde.image --group General --key Image /home/iggames/code/JeremyLeland.github.io/wallpapers/small_memory_4k_minimalism_wallpapers_3840x2160.jpg
