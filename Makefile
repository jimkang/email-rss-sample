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
	node tests/format-rss-posts-into-html-tests.js

build-html:
	node sample-rss-into-html.js \
		--styleMarkupFile behavior/default-style.html \
		https://smidgeo.com/bots/godtributes/rss/index.rss \
		https://smidgeo.com/bots/colorer/rss/index.rss \
		https://smidgeo.com/bots/autocompletejok/rss/index.rss \
		https://smidgeo.com/bots/hills/rss/index.rss \
		> launch-bay/email.html

build-email: build-html
	node html-into-email.js \
		--to $(TO_EMAIL) \
		--from $(FROM_EMAIL) \
		--htmlFile launch-bay/email.html \
		> launch-bay/email.txt

send-email:
	sendmail $(TO_EMAIL) < launch-bay/email.txt

build-and-send-email: build-email send-email

