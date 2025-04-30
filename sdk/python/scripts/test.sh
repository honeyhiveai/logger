#!/usr/bin/env bash

# Install the package in development mode
pip3 install -e .

# Run the tests
python3 -m pytest test_logger.py -v 