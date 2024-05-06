# pr-lint-action

A GitHub Action that verifies your pull request contains a reference to a
ticket. You can use this to (optionally) check:

- The PR title contains `[PROJ-1234]`
- The branch name contains `PROJ-1234` or `PROJ_1234`
- First commit contains `[PROJ-1234]`

Forked changes:

- Instead of all commits requiring ticket reference, only the first commit is
  checked
- Re-written to be a JavaScript action instead of a Docker based one to speed up
  action

## Usage

Add `.github/workflows/main.yml` with the following:

```yaml
name: PR Lint
on: [pull_request]
jobs:
  pr_lint:
    runs-on: ubuntu-latest
    steps:
    - uses: vijaykramesh/pr-lint-action@v2.3
      with:
        projects: |
            'PROJ'
            'ABC'
        check-title: true
        check-branch: true
        check-commits: true
        ignore-case: true
        require-brackets: true
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Local Development

Run `npm install` to install any dependencies needed.

## Testing

Run `npm test` to test:

## Lint

Run `npm lint` to run ESLint. Run `npm lint --fix` to fix any issues that it
can.

## Contributing

If you have other things worth automatically checking for in your PRs, please
submit a pull request.
