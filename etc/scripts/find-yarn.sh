#!/bin/bash

set -e

NODE=$1
if [[ ! -x "${NODE}" ]]; then
    >&2 echo "Usage: find-yarn.sh path-to-node"
    exit 1
fi

: "${YARN_DIR:=/opt/compiler-explorer/yarn}"

find_yarn() {
    if [[ -x ${YARN_DIR}/bin/yarn ]]; then
        echo ${YARN_DIR}/bin/yarn
        return
    fi

    which yarn
}

print_error() {
    >&2 cat <<EOM
Compiler Explorer needs yarn installed and available to work. Visit https://yarnpkg.com/ for
more details. Compiler Explorer looks in \${YARN_DIR}, then the path.
EOM
}

YARN=$(find_yarn)
if [[ ! -x "${YARN}" ]]; then
    >&2 echo Could not find a yarn executable.
    print_error
    exit 1
fi

YARNJS=${YARN}.js

if [[ ! -f "${YARNJS}" ]]; then
    >&2 echo Could not find a yarn.js file.
    print_error
    exit 1
fi

VERSION=$(${NODE} ${YARNJS} --version)

echo ${NODE} ${YARNJS} > $2
