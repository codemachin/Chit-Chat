# Chit-Chat, a chat app

Robust MEAN one-to-one chat application using socket.io

## Features

		1) Login(encrypted)
		2) Signup(encrypted)
		3) one to one chat
		4) forgot password functionality
		5) user logged in
		6) user left
		7) user typing
		8) participant information
		9) totally realtime

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

		1) Nodejs
		2) Mongodb
		3) NPM
		4) Socket IO

### Installing

A step by step series of examples that tell you have to get a development env running

Setting Prerequisites

```
	1) Start mongodb by running mongod
	2) Check node is above version 6.0. Check by typing node -v in terminal
```

Setting up the local server

```
	1) Unzip the file
	2) Open terminal and change its location the where you unzipped the file
	3) run command npm install
	4) After all dependencies are installed. Run command node app.js in your terminal.
	5) let the server start
```

Getting started

```
	1) Visit http://localhost:3000 on your browser
	2) Select signup to create a new account
	3) Chat on this nice and beautiful chat application. 
```

## How to use

```
	1) Use a unique username to start with
	2) After logging in, users who are online are representated with green dot
	3) Users who are offline are representated with red dot 
	4) click on a particular user to start the chat.
	5) To move back press the red back button on top of the page
	6) Use top green buttomn to logout
```



## Deployment on linux server

```
	1) Create new directory by : mkdir dirname
	2) Add git origin by : git remote add origin https://github.com/codemachin/Chit-Chat.git
	3) pull files: git pull origin master  
	4) cd into that folder
	5) Run npm install to install all dependencies
	6) run node app.js to start the server
```

## Built With

* Bootstrap
* nodejs
* Socket IO

## Versioning

chitchat version 1.0

## Authors

* **Vivek Shankar** 

