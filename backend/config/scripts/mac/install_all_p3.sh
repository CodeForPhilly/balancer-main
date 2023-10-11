#!/bin/bash

INSTALL_ROOT="$1"
if ! [ "$INSTALL_ROOT" ]
then
    echo "Pleae pass INSTALL_ROOT as arg on run. See MAC_OS_INSTALLATION.md"
    exit 1
fi

# Build the base image
echo "Building the balancer backend base image"
(cd "$INSTALL_ROOT" && cd ../../../ && make build-base-image && make build-project)|| exit
