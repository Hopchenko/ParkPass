#!/bin/sh
# Xcode build phase: copies the data, strings and artwork the app shares with
# the web app into the bundle, so iOS never keeps its own copies.
#   shared/parks.json, shared/map.json   (npm run export:shared)
#   parkpass-web/messages/{sv,en}.json   UI strings, read by L10n
#   parkpass-web/public/pins/*.webp      pin artwork
#   parkpass-web/public/pinboard-fabric-seamless.webp
set -eu

REPO="${SRCROOT}/.."
DEST="${TARGET_BUILD_DIR}/${UNLOCALIZED_RESOURCES_FOLDER_PATH}"

mkdir -p "${DEST}/pins" "${DEST}/messages"
cp "${REPO}/shared/parks.json" "${REPO}/shared/map.json" "${DEST}/"
cp "${REPO}/parkpass-web/messages/sv.json" "${REPO}/parkpass-web/messages/en.json" "${DEST}/messages/"
cp "${REPO}/parkpass-web/public/pins/"*.webp "${DEST}/pins/"
cp "${REPO}/parkpass-web/public/pinboard-fabric-seamless.webp" "${DEST}/"
