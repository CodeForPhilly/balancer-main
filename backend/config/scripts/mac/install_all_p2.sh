#!/bin/bash
bash install_utils.sh


echo "Checking for code dir..."
if [ -d /Users/Shared/code ]
then
  echo "Found /Users/Shared/code"
else
  echo "Creating code dir..."
  sudo mkdir -p /Users/Shared/code
fi

if [[ $(stat -f "%Su" /Users/Shared/code) == "root" ]]
then
  echo "Setting owner on code dir to $(whoami) ..."
  sudo chown -R $(whoami) /Users/Shared/code/
fi

echo "Checking for balancer repo..."
if ! [[ -d /Users/Shared/code/balancer/ ]]
then
    echo balancer is not present in /Users/Shared/balancer
    while ! [ -d /Users/Shared/code/balancer ]
    do
    echo "Cloning balancer dir into /Users/Shared/..."
    git clone git@github.com:CodeForPhilly/balancer-main.git /Users/Shared/code/balancer
    if ! [ -d /Users/Shared/code/balancer ]
    then
        while true
        do
        read -rp "Failed to clone repo. Press enter to retry"
        case $yn in
            * ) break;;
        esac
        done
    fi
    done
else
    echo balancer found in /Users/Shared/
fi


