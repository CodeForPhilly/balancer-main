#!/bin/bash

# Install docker
echo "Checking for docker..."
if ! [[ $(brew list docker 2> /dev/null) ]]
then
  echo "Installing docker..."
  brew install --cask docker
else
  echo "Found docker";
fi
