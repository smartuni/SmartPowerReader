# SmartPowerReader Sensor Node

This program is run on the sensor node.

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
