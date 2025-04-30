#!/usr/bin/env bash

# Clean previous builds
rm -rf build/ dist/ *.egg-info/

# Build the package
python3 setup.py sdist bdist_wheel

echo "Build complete. Distribution files are in dist/" 