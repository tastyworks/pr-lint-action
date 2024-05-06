import { run } from './main'
import * as core from '@actions/core'
import { context, getOctokit } from '@actions/github'

const GITHUB_GET_INPUT_ARGS = {
  required: true
}

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
  const githubToken = core.getInput('github-token', GITHUB_GET_INPUT_ARGS)
  const octokit = getOctokit(githubToken)
  return (await octokit.rest.pulls.listCommits(listCommitsParams)).data.map(
    entry => entry.commit.message
  )
}

async function check(): Promise<void> {
  try {
    const inputConfig = {
      projects: core.getMultilineInput('projects', GITHUB_GET_INPUT_ARGS),
      check_title: core.getBooleanInput('check-title', GITHUB_GET_INPUT_ARGS),
      check_branch: core.getBooleanInput('check-branch', GITHUB_GET_INPUT_ARGS),
      check_commits: core.getBooleanInput(
        'check-commits',
        GITHUB_GET_INPUT_ARGS
      ),
      ignore_case: core.getBooleanInput('ignore-case', GITHUB_GET_INPUT_ARGS),
      require_brackets: core.getBooleanInput(
        'require-brackets',
        GITHUB_GET_INPUT_ARGS
      )
    }

    const { pull_request } = context.payload

    if (!pull_request) {
      core.setFailed('Not a pull request')
      return
    }

    const details = {
      owner: context.repo.owner,
      repo: context.repo.repo,
      title: pull_request.title,
      branch: pull_request.head.ref,
      number: pull_request.number
    }

    const errors = await run(inputConfig, details, octokitFetchCommits)
    if (errors.length > 0) {
      for (const msg of errors) {
        core.error(msg)
      }
      core.setFailed('PR Linting Failed')
    }
  } catch (exception) {
    if (exception instanceof Error) {
      core.setFailed(exception)
    } else {
      core.setFailed(`${exception}`)
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
check()
