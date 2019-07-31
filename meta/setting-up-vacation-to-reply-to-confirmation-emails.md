# Setting up vacation to auto-reply to confirmation emails

- `sudo apt install vacation`
- `vacation`, follow prompts, will create .vacation.msg and .forward.
- Avoid replying to internal emails from the machine: `echo internal@email.here | vacation -x`
- `vi .vacation.msg`. If you're working with Tinyletter's send confirmation, you need to change the subject line to `Subject: $SUBJECT`

