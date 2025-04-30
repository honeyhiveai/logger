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

# Check if NPM_TOKEN is set
if [ -z "$NPM_TOKEN" ]; then
    echo "Error: NPM_TOKEN environment variable is not set"
    exit 1
fi

# Run tests unless skipped
if [ "$SKIP_TESTS" = false ]; then
    echo "Running tests..."
    if ! npm test; then
        echo "Tests failed. Aborting publish."
        exit 1
    fi
    echo "Tests passed successfully."
fi

# Get current version from package.json
current_version=$(node -p "require('./package.json').version")
echo "Current version: $current_version"

# If version is malformed, start from 0.1.0
if [[ ! $current_version =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "Warning: Current version is malformed. Resetting to 0.1.0"
    current_version="0.1.0"
fi

# Calculate new version
IFS='.' read -r major minor patch <<< "$current_version"
[[ "$major" =~ ^[0-9]+$ ]] || major=0
[[ "$minor" =~ ^[0-9]+$ ]] || minor=0
[[ "$patch" =~ ^[0-9]+$ ]] || patch=0
new_patch=$((patch + 1))
new_version="$major.$minor.$new_patch"

echo "New version: $new_version"

# Update version in package.json
npm version "$new_version" --no-git-tag-version

# Configure npm with auth token
echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > .npmrc

# Build the package (if needed)
if [ -f "build.sh" ]; then
    ./scripts/build.sh
fi

# Check if package is scoped
PACKAGE_NAME=$(node -p "require('./package.json').name")
if [[ $PACKAGE_NAME == @* ]]; then
    echo "Note: Publishing scoped package $PACKAGE_NAME"
    echo "Make sure the organization exists on npm before publishing"
fi

# Publish to npm
if ! npm publish --access public; then
    echo "Error: Failed to publish package to npm"
    echo "If this is a scoped package, make sure:"
    echo "1. The organization exists on npm"
    echo "2. You have access to publish to that organization"
    echo "3. The package name matches the organization"
    rm .npmrc
    exit 1
fi

# Clean up npm token
rm .npmrc

# Only proceed with git operations if npm publish was successful
git add package.json package-lock.json
git commit -m "v$new_version"
git tag "v$new_version"
git push origin main --tags

echo "Package published successfully!" 