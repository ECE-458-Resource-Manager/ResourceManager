[![Build Status](https://travis-ci.org/ECE-458-Resource-Manager/ResourceManager.svg?branch=master)](https://travis-ci.org/ECE-458-Resource-Manager/ResourceManager)

# ResourceManager
Project for ECE 458 - Engineering Software Maintainability

A web application for resource management.

Created by Allan Kiplagat, Davis Gossage, Emmanuel Shiferaw, and Sam Ginsburg.

## Cloning

When cloning, make sure to include all project submodules with the --recursive option:

`git clone --recursive https://github.com/ECE-458-Resource-Manager/ResourceManager.git`

If already cloned without submodules, use:

`git submodule update --init --recursive`


## Deploying

To deploy to the aws instance using the mup package, use the following commands:

Install mup: `npm install -g mup`

Obtain the .pem file for the aws instance and modify mup.json to point to it

Setup/update mup remotely: `mup setup`

Deploy mup: `mup deploy`

