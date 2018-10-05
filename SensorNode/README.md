# SmartPowerReader Sensor Node

This program is run on the sensor node.

## Ablauf first setup

Explains the process of setting up a new sensor node

1. Sensor connected to network
2. Sensor send POST request to pi (using DODAG root address) at /register to register itself
  - any relevant data can be send here as payload
3. RPI ACK (empty response, etc..)
  - the IP of the sensor will be saved
  - admin click on sensor from webui
    + send a packet to the sensor node to trigger the configuration mode
    + LED will blink in configuration mode, admin can now identify which
sensor this is and set location through web UI
4. After finish configuration, RPI send OBSERVE request to sensor at /value
5. Sensor sends sensor value to RPI at every defined interval

## How to run

1. Clone the `smartuni/SmartPowerReader` from Github:

NOTE: We are using upstream RIOT as submodule here. So make sure to pass 
`--recursive-submodules` to the `git clone` command.

```Shell
git clone --recurse-submodules https://github.com/chaconinc/MainProject
```

2. Make sure to have all the dependencies required to build and flash a
RIOT project.

Please refer to RIOT wiki for the dependency list.

3. Build the project:

```Shell
make BOARD=samr21-xpro
```

4. Flash the binary to board:

NOTE: Make sure board is connected to your computer and detected. Under Linux
you will see `/dev/ACM#` where `#` is a digit.

```Shell
make flash BOARD=samr21-xpro
```

5. Debug the board using terminal

The Python package `serial` is needed for this. Under Ubuntu, you can install
it using:

```Shell
$ sudo apt install python3-serial
```

When all dependencies installed, we can use the term:

```Shell
make term BOARD=samr21-xpro
```
