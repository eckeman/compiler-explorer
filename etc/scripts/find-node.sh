#!/bin/bash

set -e

: "${NODE_DIR:=/opt/compiler-explorer/node}"
REQUIRED_MAJOR="v8"

find_node() {
    if [[ -x ${NODE_DIR}/bin/node ]]; then
        echo ${NODE_DIR}/bin/node
        return
    fi

    which node || which nodejs
}

print_error() {
    >&2 cat <<EOM
Compiler Explorer needs node version ${REQUIRED_MAJOR} installed and available to work. Visit https://nodejs.org/ for
more details. Compiler Explorer looks in \${NODE_DIR}, then the path.
EOM
}

NODE=$(find_node)
if [[ ! -x "${NODE}" ]]; then
    >&2 echo Could not find a node or nodejs executable.
    print_error
    exit 1
fi

VERSION=$(${NODE} --version)
MAJOR_VERSION=$(echo ${VERSION} | cut -f1 -d.)
if [[ "${MAJOR_VERSION}" != "${REQUIRED_MAJOR}" ]]; then
    >&2 echo "Found an incompatible node version (${VERSION})."
    print_error
    exit 1
fi

echo ${NODE}