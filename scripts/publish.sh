#!/usr/bin/env bash

# Parse arguments
SKIP_TESTS=false
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --skip-tests) SKIP_TESTS=true ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

# Check if PYPI_TOKEN is set
if [ -z "$PYPI_TOKEN" ]; then
    echo "Error: PYPI_TOKEN environment variable is not set"
    exit 1
fi

# Run tests unless skipped
if [ "$SKIP_TESTS" = false ]; then
    echo "Running tests..."
    if ! ./scripts/test.sh; then
        echo "Tests failed. Aborting publish."
        exit 1
    fi
    echo "Tests passed successfully."
fi

# Get current version from setup.py
current_version=$(sed -n 's/.*version="\([^"]*\)".*/\1/p' setup.py)
echo "Current version: $current_version"

# If version is malformed, start from 0.0.0
if [[ ! $current_version =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "Warning: Current version is malformed. Resetting to 0.0.0"
    current_version="0.0.0"
fi

# Calculate new version
IFS='.' read -r major minor patch <<< "$current_version"
[[ "$major" =~ ^[0-9]+$ ]] || major=0
[[ "$minor" =~ ^[0-9]+$ ]] || minor=0
[[ "$patch" =~ ^[0-9]+$ ]] || patch=0
new_patch=$((patch + 1))
new_version="$major.$minor.$new_patch"

echo "New version: $new_version"

# Update version in setup.py
sed -i '' "s/version=\".*\"/version=\"$new_version\"/" setup.py

# Build the package
./scripts/build.sh

# Publish to PyPI
python3 -m twine upload --username __token__ --password "$PYPI_TOKEN" dist/*

# Commit the new version
git add setup.py
git commit -m "v$new_version"
git tag "v$new_version"
git push origin main --tags

echo "Package published successfully!"