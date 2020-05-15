# Homebridge-github-backuper

Plugin to homebridge, adding accessory into homekit, where you can backup defined files into Github repository.

_Recommend create second backuper credentials into github with access into backup repository._

###### Example config:
    "platforms": [
        {
            "accessory": "Github Backuper",
            "platform": "Github Backuper",
            "githubUsername": "", #github login
            "githubPassword": "", # github password
            "githubRepository": "", # example: PilarJ/homebridge-github-backup.git
            "githubName": "Jakub Pilař", # display name in github
            "githubEmail": "pilarjakub@centrum.cz", # github email
            "filesToBackup": [
                "/var/lib/homebridge/config.json"
            ]
        }
    ]