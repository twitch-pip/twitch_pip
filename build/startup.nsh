!macro customInstall
      CreateShortCut "$SMSTARTUP\ISEGYE-IDOL Twitch PIP.lnk" "$INSTDIR\ISEGYE-IDOL Twitch PIP.exe"
!macroend

!macro customRemoveFiles
    Sleep 3000
    RMDir /r $INSTDIR
!macroend
