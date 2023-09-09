#!/bin/bash

echo "Checking for .ssh dir"
if ! [ -d /Users/"$(whoami)"/.ssh ]
then
    echo "Creating /Users/$(whoami)/.ssh dir";
    mkdir -p /Users/"$(whoami)"/.ssh;
else
    echo "Dir found!"
fi

echo "Checking for .ssh/config"
if ! [ -f /Users/"$(whoami)"/.ssh/config ]
then
    echo "No /Users/$(whoami)/.ssh/config. Creating...";
    touch /Users/"$(whoami)"/.ssh/config;
else
    echo "File found!"
fi    

# Add rsa key (for use by gitlab)
echo "Checking for rsa key..."
if [ -f /Users/"$(whoami)"/.ssh/id_rsa ]
then
  echo "Rsa key found @ /Users/$(whoami)/.ssh/id_rsa"
else
  echo "Generating rsa key..."
  ssh-keygen
fi
