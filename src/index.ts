import { run } from './main.js'
import * as core from '@actions/core'
import { context, getOctokit } from '@actions/github'

const githubInputArgs = {
  required: true
}

const inputConfig = {
  projects: core.getMultilineInput('projects', githubInputArgs),
  check_title: core.getBooleanInput('check-title', githubInputArgs),
  check_branch: core.getBooleanInput('check-branch', githubInputArgs),
  check_commits: core.getBooleanInput('check-commits', githubInputArgs),
  ignore_case: core.getBooleanInput('ignore-case', githubInputArgs),
  require_brackets: core.getBooleanInput('require-brackets', githubInputArgs)
}

const githubToken = core.getInput('github-token', githubInputArgs)

async function octokitFetchCommits(
  owner: string,
  repo: string,
  pull_number: number
): Promise<string[]> {
  const listCommitsParams = {
    owner,
    repo,
    pull_number
  }
  const octokit = getOctokit(githubToken)
  return (await octokit.rest.pulls.listCommits(listCommitsParams)).data.map(
    entry => entry.commit.message
  )
}

const { pull_request } = context.payload

if (!pull_request) {
  throw new Error('Not a pull request')
}

const details = {
  owner: context.repo.owner,
  repo: context.repo.repo,
  title: pull_request.title,
  branch: pull_request.head.ref,
  number: pull_request.number
}

run(inputConfig, details, octokitFetchCommits)
  // eslint-disable-next-line github/no-then
  .then(errors => {
    if (errors.length > 0) {
      for (const msg of errors) {
        core.error(msg)
      }
      core.setFailed('PR Linting Failed')
    }
  })
  // eslint-disable-next-line github/no-then
  .catch(exception => {
    core.setFailed(exception)
  })
