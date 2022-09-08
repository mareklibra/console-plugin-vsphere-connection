# Various scripts and data files to simplify builds and day-to-day life

## frozen_node_modules.tar.xz
A compressed pre-downloaded node_modules folder which must be kept in sync with recent package.json and yarn.lock files.

Reason: Having that file is the easiest way how to enable builds in offline build environments.

## update-frozen_node_modules.sh
Script updating ./hack/frozen_node_modules.tar.xz file.

As a side effect, the node_modules directory is deleted and recreated.

Prefered way of calling this script:
```
$ yarn update-update-frozen_node_modules
```

