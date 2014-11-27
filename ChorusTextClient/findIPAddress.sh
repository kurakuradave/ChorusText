#!/bin/bash
ifconfig | grep 192.168 | cut -c10-35 | sed "s/inet addr\://g"
