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
	$(SSHCMD) "cd /opt/$(PROJECTNAME) && npm install --ignore-scripts"
# --ignore-scripts is just to avoid the native quoted-printable.

prettier:
	prettier --single-quote --write "**/*.js"

test:
	node tests/sample-rss-tests.js
	node tests/format-rss-posts-into-html-tests.js

build-html:
	node sample-rss-into-html.js \
		--styleMarkupFile behavior/bots-style.html \
    --postsPerFeed 5 \
		--ignoreDates true \
    --showFeedTitles false \
    --addLinksToPosts true \
    --enclosureTag ul \
    --urlPrefixToLinkTitleFile behavior/url-prefixes-for-link-titles.json \
    --closingTextFile behavior/bots-closing.html \
		https://theoldreader.com/profile/jimkang.rss \
		> launch-bay/email.html

# TODO: Generate an intro every email
    # --introTextFile behavior/intro-message.html \
		--numberOfDaysToSample $(DAYSTOSAMPLE) \

build-email: build-html
	node html-into-email.js \
		--to $(TO_EMAIL) \
		--from $(FROM_EMAIL) \
		--unsubscribeEmail $(UNSUB_EMAIL) \
		--htmlFile launch-bay/email.html \
		> launch-bay/email.txt

send-email:
	./send-to-list.sh launch-bay/email.txt behavior/list.txt

build-and-send-email: build-email send-email
