
FILE_EXT=`test -f file-extension.info && cat file-extension.info`
install: clean
	@npm i --package-lock-only 1> /dev/null
	@git clone https://github.com/fusionpoweredsoftware/hex96 1> /dev/null
	@npm audit fix --force 1> /dev/null
	@npm link 1> /dev/null
	@npm link hex96 fusion-point 1> /dev/null
	@make unique-if-not
	@printf "\nInstallation completed.\n"
clean: testclean
	@npm unlink hex96 fusion-point 1> /dev/null
	@rm -rf hex96 1> /dev/null
	@rm package-lock.json 1> /dev/null
	@rm -rf node_modules
unique:
	@( test -f salt.hex && echo 'Unique salt already generated.' ) || node gensalt
renew: 
	@( test -f salt.hex && test -f file-extension.info ) || echo 'Unique salt and file extension info must exist for renewal.'
	@( test -f salt.hex && test -f file-extension.info ) && cp "salt.hex" "salt${FILE_EXT}.hex" && node gensalt || true;
unique-if-not:
	@( test -f salt.hex ) || node gensalt
test: testclean
	@( test -f salt.fp.test.hex ) || node gensalt salt.fp.test.hex
	@( test -f salt.fp.test.hex ) && node testing || echo 'ERROR: No test salt file found.'

testclean:
	@rm -f testing/encrypted_output/* 1> /dev/null