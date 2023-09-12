# Welcome to Apple Land!

## Purpose

In order to make backend installation seamless and easy, we've built a few scripts to automate setup.

## Tooling

### Github

We host our code on [github](https://github.com/CodeForPhilly/balancer-main), and automate the ability to pull and push code.

### Homebrew

We utilize Apple's community maintained package manager ([homebrew](https://brew.sh/)) to automate tooling installation.

### Docker

To make setup as operating system/environment agnostic and to prevent conflicts with non-balancer related work you may do on the same machine, we use [docker](https://www.docker.com/) to containerize the balancer project.

## Pre-requisites

The installation scripts make a few assumptions in order to isolate the balancer code from the rest of your computing environment. These assumptions should be satisfied before running the scripts (described below).

1. A group exists named "Programmers".

   ### Add the group

   See Apple's documentation [here](https://support.apple.com/guide/mac-help/add-a-user-or-group-mchl3e281fc9/mac).

   - Note: The group name is case sensitive. Make sure to capitalize!

2. The current user belongs to the group, "Programmers".
   ### Add the current user to the group.
   See Apple's documentation [here](https://support.apple.com/guide/mac-help/add-a-user-or-group-mchl3e281fc9/mac).

## Running the scripts

### Note: This script is idempotent ...

meaning you can run it as many times as necessary (and then some) without getting a different result as the first time you ran it. If a package is already installed (via homebrew) or a file/directory is already present, the scripts won't try to re-install or re-create them.

### Order matters

Since there is an execution order (and potential need to reboot) between steps, the scripts are broken up into parts (i.e, p1, p2, etc...)

1. First, in a terminal, navigate to the backend repo's mac installation directory. Let's say you downloaded the project such that GIT_REPO=/Users/$YOUR_USER/balancer. As such, you'll want to run
   `cd $GIT_REPO/backend/config/scripts/mac`

2. Run the first installation script.
   In the same terminal used to perform step 1, run
   `./install_all_p1.sh`

   #### Side effects

   This will

   1. Install homebrew (if it is not already installed) with the proper permissions for the current user.
   2. Add an ssh key (if one named id_rsa doesn't already exist) at /Users/$CURRENT_USER/.ssh.

3. Register your ssh key to github
   Before running any other commands in your terminal, you'll need to [register your ssh key to github](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account?tool=webui) (if you haven't already).

   Your public ssh key can be found by opening a new terminal and running
   `cat /Users/$(whoami)/.ssh/id_rsa.pub`

4. Run the second installation script.
   Returning the initial terminal you opened (steps 1 and 2), you'll now run
   `./install_all_p2.sh`

   #### Side effects

   This will

   1. Install docker (if it isn't already)

5. Restart your computer.
   We'll most likely get our intended results running docker after a reboot.
   Make sure you are in the "23-add-mac-installation-flow" branch and at "/backend/config/scripts/mac" directory

7. Run the third installation script `./install_all_p3.sh "$(pwd)"`

   #### Side effects

   This will

   1. Build (or rebuild) the necessary balancer-backend images.

#### Viola!

You should now be able to navigate back to your $GIT_REPO/backend location and run
`make launch-local-project`
