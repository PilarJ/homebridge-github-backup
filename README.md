# Homebridge-github-backuper

Plugin to homebridge, adding accessory into homekit, where you can backup defined files into Github repository.

_Recommend create second backuper credentials into github with access into backup repository._


###### Example Http config:
    "platforms": [
        {
            "accessory": "Github Backuper",
            "platform": "Github Backuper",
			"conenctMethod": "https" #defaults to https
            "githubUsername": "", #github login
            "githubPassword": "", # github password
            "githubRepository": "", # example: PilarJ/homebridge-github-backup.git
            "githubName": "Jakub Pilař", # display name in github
            "githubEmail": "pilarjakub@centrum.cz", # github email
	    	"branch": "main", #defaults to main
            "filesToBackup": [
                "/var/lib/homebridge/config.json"
            ]
        }
    ]

SSH configuration removes the need for storing your password in the config file.  You need to ensure that the user (usually homebridge) has a ssh key configured and the public key has been added to your github profile
###### Example SSH config:
    "platforms": [
        {
            "accessory": "Github Backuper",
            "platform": "Github Backuper",
	    	"connectMethod": "ssh",
            "githubRepository": "", # example: PilarJ/homebridge-github-backup.git
            "githubName": "Jakub Pilař", # display name in github
            "githubEmail": "pilarjakub@centrum.cz", # github email
	    	"branch": "main", #defaults to main
            "filesToBackup": [
                "/var/lib/homebridge/config.json"
            ]
        }
    ]
