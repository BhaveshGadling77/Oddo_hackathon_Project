#!/bin/bash
# this is script for mysql server.

sudo mysql

CREATE DATABASE users;

CREATE USER 'user'@'localhost' IDENTIFIED BY 'still12';

GRANT ALL PRIVILEGES ON users.* TO 'user'@'localhost';

FLUSH PRIVILEGES;