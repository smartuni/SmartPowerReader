# Steps to setup the RPI for 6LoWPAN & RPL

1. Get fresh image of raspbian from raspberrypi.org
2. Enable SSH for [headless setup](https://www.raspberrypi.org/documentation/remote-access/ssh/README.md)
3. Follow all the steps (excluding 4, we don't need new kernel here) to setup 6LoWPAN
4. Setup simpleRPL for RPL routing. Pi as DODAG root

Now all sensor node in the same DODAG will automatically have a global address
and can to talk to the pi.

## Install simpleRPL

NOTE: You may get error no permission. Use `sudo` then. This may not be the
best way, it should only be temporary.

```Shell
# we need to build dependencies for simpleRPL first
apt-get install cython libcap-dev
git clone git@github.com:tcheneau/RplIcmp.git
cd RplIcmp

make lib
python setup.py install
cd ..

apt-get install libnl-cli-3-dev
git clone git@github.com:tcheneau/Routing.git
cd Routing
make build-module
python setup.py install
cd ..

apt-get install python-zmq
git clone git@github.com:tcheneau/simpleRPL.git
cd simpleRPL

# installing simpleRPL
python setup.py install
cd ..

# then start the rpl using the pi's global address as prefix
simpleRPL.py -i lowpan0 -vvvvv -R -d 2001:aaaa::0202:0007:0001 \
  -p 2001:aaaa::
```
