## Overview

A simple command line tool designed to help build a Cloudformation Parameter file, based on the parameters in a given CFN Template.

## Usage

```
    $ cfn-build-parameters <template_file>

  Options
    --output, -o     Output filename
    --nolint         Skip cfn-lint testing

  Examples
    $ cfn-build-parameters mytemplate.yaml -o output.json
```
