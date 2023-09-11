#!/bin/bash

# Create programmer group w/ for brew access (in case multiple users)
GROUP_NAME="Programmers"

echo "Checking groups permissions..."
echo "Checking $GROUP_NAME exists"
if ! (grep -e "$GROUP_NAME" <<< "$(dscl . list /Groups)" >> /dev/null)
then
    echo "Please install group named $GROUP_NAME. See (https://support.apple.com/guide/mac-help/add-a-user-or-group-mchl3e281fc9/mac)"
else
    echo "Found group, '$GROUP_NAME'."
fi

echo "Checking $(whoami) in $GROUP_NAME"
if ! (grep $GROUP_NAME <<< "$(id -nG "$(whoami)")" >> /dev/null)
then 
    echo "Please add $(whoami) to $GROUP_NAME. See (https://support.apple.com/guide/mac-help/add-a-user-or-group-mchl3e281fc9/mac)."
else
    echo "Confirmed $(whoami) in $GROUP_NAME".
fi

# Install homebrew
echo "Checking for brew..."
if ! [[ $(which brew 2> /dev/null) ]]
then
  echo "Installing brew..."
  bash <(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)
    (echo; echo 'eval "$(/opt/homebrew/bin/brew shellenv)"') >> /Users/$(whoami)/.zprofile
    eval "$(/opt/homebrew/bin/brew shellenv)"
else
  echo "Found brew"
fi

echo Modifying permissions for brew cleanup
echo Setting group ownership and permissions on /opt/homebrew dirs
sudo chown -R :$GROUP_NAME /opt/homebrew/share/aclocal /opt/homebrew/share/locale /opt/homebrew/var/homebrew/locks
sudo chmod g+w /opt/homebrew/share/aclocal /opt/homebrew/share/locale
PREVIOUS_OWNER="$(sudo ls -ld /opt/homebrew/var/homebrew/locks/ | awk '{print $3}')"
echo Temporarily changing owner of /opt/homebrew/var/homebrew/locks for cleanup
sudo chown -R "$(whoami)" /opt/homebrew/var/homebrew/locks
echo Running brew cleanup
brew cleanup
echo Restoring owner
sudo chown -R "$PREVIOUS_OWNER" /opt/homebrew/var/homebrew/locks

# May need to run if no origin
#git config --global --add safe.directory /opt/homebrew
#git -C "/opt/homebrew" remote add origin https://github.com/Homebrew/brew
echo "Updating brew..."
brew update-reset && brew update
