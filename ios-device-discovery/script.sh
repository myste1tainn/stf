#!/bin/bash

/usr/local/bin/iproxy 10000 8100 > ~/Desktop/iproxy.log 2>&1 &

USE_PORT=10000

/usr/bin/xcodebuild clean build test \
    -project ./wda/WebDriverAgent.xcodeproj \
    -scheme WebDriverAgentRunner \
    -destination id=296a0e0b33a5242977b89cd69d0be02ef1cf96f2 \
    -configuration Debug \
    IPHONEOS_DEPLOYMENT_TARGET=11.4