# Conventional Changelog action

This action is a derivate of [TriPSs/conventional-changelog-action](https://github.com/TriPSs/conventional-changelog-action).

This action will bump version, and generate a changelog with conventional commits. ***It will not commit/tag/push on your git.***

## Inputs

- **Required** `github-token`: Github token.
- **Optional** `tag-prefix`: Prefix for the git tags. Default `v`.
- **Optional** `version`: The version to bump. Will result in `version` output. If not present, it will not output `version`
- **Optional** `config-file-path`: Path to the conventional changelog config file.

### Config-File-Path
A config file to define the conventional commit settings. Use it if you need to override values like `issuePrefix` or `issueUrlFormat`. If you set a `config-file-path`, the `preset` setting will be ignored. Therefore use an existing config and override the values you want to adjust.

example:  
```javascript
'use strict'
const config = require('conventional-changelog-conventionalcommits');

module.exports = config({
    "issuePrefixes": ["TN-"],
    "issueUrlFormat": "https://jira.example.com/browse/{{prefix}}{{id}}"
})
```
The specified path can be relative or absolute. If it is relative, then it will be based on the `GITHUB_WORKSPACE` path.

Make sure to install all required packages in the workflow before executing this action.

## Outputs

- `changelog`: The generated changelog for the new version.
- `clean_changelog`: The generated changelog for the new version without the version name in it (Better for Github releases)
- `version`: The new version.
- `tag`: The name of the generated tag.
- `skipped`: Boolean (`'true'` or `'false'`) specifying if this step have been skipped

## Example usages

Bump version

```yaml
- name: Read Version
  id: vars
  run:
    

- name: Conventional Changelog Action
  uses: ci010/conventional-changelog-action@master
  with:
    github-token: ${{ secrets.github_token }}
    version: ${{ steps.vars.ver }}
```
