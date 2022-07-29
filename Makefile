MAKEFLAGS	= --no-print-directory --no-builtin-rules
SHELL := /bin/bash

SYSTEM_PYTHON   = $(or $(shell which python3), $(shell which python))
PYTHON		= $(or $(wildcard venv/bin/python), $(SYSTEM_PYTHON))
SYSTEM_PIP	= $(or $(shell which pip3), $(shell which pip))
PIP		= $(or $(wildcard venv/bin/pip), $(SYSTEM_PIP))

PORT?=8081

deps: venv
	$(PIP) install -r requirements.txt
	$(PIP) install wheel
	$(PIP) install livereload

venv:
	$(SYSTEM_PYTHON) -m venv venv

serve:
	(\
		source ./venv/bin/activate ; \
		livereload -p ${PORT} \
	)

minify:
	$(PYTHON) minify.py
