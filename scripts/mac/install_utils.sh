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


# Install wget 
echo "Checking for wget..."
if ! [[ $(brew list wget 2> /dev/null) ]]
then
  echo "Installing wget..."
  brew install wget
else
  echo "Found wget";
fi
