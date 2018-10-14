# Makefile to start the ct-sensor and print some values to console, without networking

APPLICATION = ct_sensor_example

BOARD ?= native

RIOTBASE ?= $(CURDIR)/../RIOT

FEATURES_REQUIRED = periph_adc

USEMODULE += xtimer
USEMODULE += fmt

DEVELHELP ?= 1

QUIET ?= 1

include $(RIOTBASE)/Makefile.include
