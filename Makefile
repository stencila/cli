setup:
	bash kcov-install.sh

test:
	bash test.sh

cover:
	kcov --exclude-pattern=test.sh coverage test.sh