#!/bin/bash

emailtextfile=$1
listfile=$2
tmpfile=launch-bay/tmp.txt

if [[ ! $emailtextfile ]] || [[ ! $listfile ]]; then
  printf "Usage: ./send-to-list.sh <text file containing message text> <text file containing recipients>\n";
  exit 1;
fi

while read -r address
    do printf "To: %s\n" "${address}" | cat - "$emailtextfile" > "$tmpfile" &&\
    sendmail "$address" < "$tmpfile"
done < "$listfile"
