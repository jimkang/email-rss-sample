include config.mk

HOMEDIR = $(shell pwd)
SSHCMD = ssh $(USER)@$(SERVER)
PROJECTNAME = email-rss-sample 
APPDIR = /opt/$(PROJECTNAME)

pushall: sync
	git push origin master

sync:
	rsync -a $(HOMEDIR) $(USER)@$(SERVER):/opt/ --exclude node_modules/ \
	  --omit-dir-times --no-perms
	$(SSHCMD) "cd /opt/$(PROJECTNAME) && npm install"

prettier:
	prettier --single-quote --write "**/*.js"

test:
	node tests/sample-rss-tests.js

