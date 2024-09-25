# magnolia-bot
 
## Table of Contents
- [Introduction](#introduction)
- [Installation](#installation)
  - [Installing Nodemon](#installing-nodemon)
- [Understanding `index.js`](#understanding-indexjs)
- [Creating New Slash Commands](#creating-new-slash-commands)
- [Updating Slash Commands on the Server](#updating-slash-commands-on-the-server)

## Introduction
Magnolia bot is the official bot for the Utah County Pokemon TCG discord server (name prone to change).
This should help answer any questions on installation and upkeep for dear Uncle Ben, bless his heart.

## Installation
Discord bots run off of Node.js, so before beginning any work on the project you will need to ensure you have an up to date Node version installed on your machine. If you need help getting that set up, google it - I'm not your mom.
### Installing Nodemon
Nodemon is a Node package that you will need to install globally. In a new terminal run the following command:
```bash
npm install -g nodemon
```

After installing Nodemon globally, make sure to run the following command in the project directory to install all necessary dependencies:

Installing it locally just for the project can lead to some weird interactions, so keep to the global install. Nodemon is
important because it allows for hot reloading of the application whenever changes are made to it, whether locally or when changes
are pulled from Github. To use it, run the following in a terminal inside the directory of the project:
```bash
nodemon ./index.js
```

## Understanding 'index.js'
Discord bots require a token in order to be functionally active. While this bot has already been 
authorized and connected to the Bois Night server, in order for any of the code to recognize any input 
from server users it needs to use its specific token. Any tokens or IDs will be stored in a .env file 
that lives in the root directory.

This line at the bottom of the script is what connects the code to the bot as long as it's running.
```javascript
client.login(process.env.TOKEN);
```

The client itself is created from the ```Client``` object in the discord node package. On creation 
you'll notice that there are several flags that are set. This allows the bot to do things like respond 
to messages, get server and user information, and have admin rights.

The code beneath the instantiation of the ```client``` creates a Collection that stores which slash 
commands are available.

Each other method call in the file is basically a listener that will interact with the messages and 
commands that come through the chat channels that Uncle Ben is a part of.

## Creating New Slash Commands
New slash commands can be created by adding a file to the 'commands' folder. Currently there is one 
sub-folder 'utility', but any number of sub-folders can be created at that level (i.e. 'commands' can 
have any number of sub-folders, but none of those can have any sub-folders as things are currently 
implemented).

## Updating Slash Commands on the Server
Once you have created a new slash command, you will need to run the deploy-commands.js script. It 
needs to run independently from the server running, but only needs to be run once, even in multiple 
new commands are implemented at a given time. That script registers all the commands in the 'commands'
 folder to the server so that you can view what is available as you're typing it in Discord. If you go 
 back and update the functionality of any slash commands you do NOT need to rerun this script.
 