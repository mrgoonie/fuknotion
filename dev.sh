#!/bin/bash

# Run wails dev and pipe all output to logs.txt
wails dev 2>&1 | tee logs.txt
