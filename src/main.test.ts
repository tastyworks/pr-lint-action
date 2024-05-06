import { FetchCommits, type InputConfig, PullRequestDetails, run } from './main'

interface FixutureParam {
  title: string
  ref_name: string
}

function pullRequestOpenedFixture({
  title,
  ref_name
}: FixutureParam): PullRequestDetails {
  return {
    owner: 'vijaykramesh',
    repo: 'pr-lint-action-test',
    title,
    branch: ref_name,
    number: 1
  }
}

const fixtureTitle: InputConfig = {
  projects: ['PROJ', 'ABC'],
  check_title: true,
  check_branch: false,
  check_commits: false,
  ignore_case: true,
  require_brackets: true
}

const fixtureBranch: InputConfig = {
  projects: ['PROJ', 'ABC'],
  check_title: false,
  check_branch: true,
  check_commits: false,
  ignore_case: true,
  require_brackets: true
}

const fixtureCommits: InputConfig = {
  projects: ['PROJ', 'ABC'],
  check_title: false,
  check_branch: false,
  check_commits: true,
  ignore_case: false,
  require_brackets: true
}

const fixtureNoBrackets: InputConfig = {
  projects: ['PROJ', 'ABC'],
  check_title: true,
  check_branch: false,
  check_commits: false,
  ignore_case: true,
  require_brackets: false
}

const fixtureNoIgnoreCase: InputConfig = {
  projects: ['PROJ', 'ABC'],
  check_title: true,
  check_branch: true,
  check_commits: false,
  ignore_case: false,
  require_brackets: true
}

const fixtureAll: InputConfig = {
  projects: ['PROJ', 'ABC'],
  check_title: true,
  check_branch: true,
  check_commits: true,
  ignore_case: true,
  require_brackets: true
}

describe('pr-lint-action', () => {
  const bad_title_and_branch = {
    title: 'no ticket in me',
    ref_name: 'no-ticket-in-me'
  }
  const good_title_and_branch = {
    title: '[PROJ-1234] a good PR title',
    ref_name: 'bug/PROJ-1234/a_good_branch'
  }
  const good_title_and_bad_branch = {
    title: '[PROJ-1234] a good PR title',
    ref_name: 'fix_things'
  }
  const bad_title_and_good_branch = {
    title: 'no ticket in me',
    ref_name: 'bug/PROJ_1234/a_good_branch'
  }
  const lower_case_good_title_and_branch = {
    title: '[proj-1234] a lower case good title',
    ref_name: 'bug/proj_1234/a_good_lowercase_branch'
  }
  const no_brackets_title_and_branch = {
    title: 'PROJ-1234 a good no brackets PR title',
    ref_name: 'bug/PROJ-1234/a_good_branch'
  }

  const good_commits = [
    'PROJ-1234 Commit 1',
    'PROJ-1234 Commit 2',
    'PROJ-1234 Commit 3'
  ]
  const lower_case_good_commits = [
    'PROJ-1234 Commit 1',
    'PROJ-1234 Commit 2',
    'abc-1234 Commit 3'
  ]
  const good_first_commit = ['PROJ-123 Commit 1', 'Commit 2', 'Commit 3']
  const bad_commits_not_first = ['Commit 1', 'PROJ-1234 Commit 2', 'Commit 3']
  const bad_commits_none = [
    'PRJ-123 Commit 1',
    'PROJ 1234 Commit 2',
    'Commit 3'
  ]

  const noCommitsCallback: FetchCommits = async () => []

  function mockGetPRCommitListRequest(commits: string[]): FetchCommits {
    return async () => commits
  }

  it('fails if check_title is true and title does not match', async () => {
    const config = fixtureTitle
    const details = pullRequestOpenedFixture(bad_title_and_good_branch)

    const errors = await run(config, details, noCommitsCallback)
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('PR title')
  })

  it('fails if bad title', async () => {
    const config = fixtureTitle
    const details = pullRequestOpenedFixture(bad_title_and_branch)

    const errors = await run(config, details, noCommitsCallback)
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('PR title')
  })

  it('fails if bad branch', async () => {
    const config = fixtureBranch
    const details = pullRequestOpenedFixture(bad_title_and_branch)

    const errors = await run(config, details, noCommitsCallback)
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('PR branch')
  })

  it('passes if check_title is false and title does not match', async () => {
    const config = fixtureBranch
    const details = pullRequestOpenedFixture(bad_title_and_good_branch)

    const errors = await run(config, details, noCommitsCallback)
    expect(errors).toHaveLength(0)
  })

  it('passes if check_title is true and title matches', async () => {
    const config = fixtureTitle
    const details = pullRequestOpenedFixture(good_title_and_branch)

    const errors = await run(config, details, noCommitsCallback)
    expect(errors).toHaveLength(0)
  })

  it('fails if check_branch is true and branch does not match', async () => {
    const config = fixtureBranch
    const details = pullRequestOpenedFixture(good_title_and_bad_branch)

    const errors = await run(config, details, noCommitsCallback)
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('PR branch')
  })

  it('passes if check_branch is false and branch does not match', async () => {
    const config = fixtureTitle
    const details = pullRequestOpenedFixture(good_title_and_bad_branch)

    const errors = await run(config, details, noCommitsCallback)
    expect(errors).toHaveLength(0)
  })

  it('passes if check_branch is true and branch matches', async () => {
    const config = fixtureBranch

    const details = pullRequestOpenedFixture(bad_title_and_good_branch)

    const errors = await run(config, details, noCommitsCallback)
    expect(errors).toHaveLength(0)
  })

  it('passes if check_commits is true and all commits match', async () => {
    const config = fixtureCommits

    const details = pullRequestOpenedFixture(good_title_and_branch)
    const errors = await run(
      config,
      details,
      mockGetPRCommitListRequest(good_commits)
    )
    expect(errors).toHaveLength(0)
  })

  it('passes if check_commits is true and first commit matches', async () => {
    const config = fixtureCommits

    const details = pullRequestOpenedFixture(good_title_and_branch)
    const errors = await run(
      config,
      details,
      mockGetPRCommitListRequest(good_first_commit)
    )
    expect(errors).toHaveLength(0)
  })

  it('fails if check_commits is true and first commit does not match', async () => {
    const config = fixtureCommits

    const details = pullRequestOpenedFixture(good_title_and_branch)
    const errors = await run(
      config,
      details,
      mockGetPRCommitListRequest(bad_commits_not_first)
    )
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('First commit')
  })

  it('fails if check_commits is true and some commits do not match', async () => {
    const config = fixtureCommits

    const details = pullRequestOpenedFixture(good_title_and_branch)
    const errors = await run(
      config,
      details,
      mockGetPRCommitListRequest(bad_commits_none)
    )
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('First commit')
  })

  it('passes if check_commits is false and all commits match', async () => {
    const config = fixtureTitle

    const details = pullRequestOpenedFixture(good_title_and_branch)
    const errors = await run(
      config,
      details,
      mockGetPRCommitListRequest(good_commits)
    )
    expect(errors).toHaveLength(0)
  })

  it('passes if check_commits is false and some commits do not match', async () => {
    const config = fixtureTitle

    const details = pullRequestOpenedFixture(good_title_and_branch)
    const errors = await run(
      config,
      details,
      mockGetPRCommitListRequest(bad_commits_none)
    )
    expect(errors).toHaveLength(0)
  })

  it('fails if check_branch and check_title is true and title does not match', async () => {
    const config = fixtureAll

    const details = pullRequestOpenedFixture(bad_title_and_good_branch)
    const errors = await run(
      config,
      details,
      mockGetPRCommitListRequest(good_commits)
    )
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('PR title')
  })

  it('passes if check_branch and check_title is true and both match', async () => {
    const config = fixtureAll

    const details = pullRequestOpenedFixture(good_title_and_branch)
    const errors = await run(
      config,
      details,
      mockGetPRCommitListRequest(good_commits)
    )
    expect(errors).toHaveLength(0)
  })

  it('passes if ignore_case and lower case title/branch', async () => {
    const config = fixtureAll

    const details = pullRequestOpenedFixture(lower_case_good_title_and_branch)
    const errors = await run(
      config,
      details,
      mockGetPRCommitListRequest(good_commits)
    )
    expect(errors).toHaveLength(0)
  })

  it('passes if ignore_case and lower case commits', async () => {
    const config = fixtureAll

    const details = pullRequestOpenedFixture(lower_case_good_title_and_branch)
    const errors = await run(
      config,
      details,
      mockGetPRCommitListRequest(lower_case_good_commits)
    )
    expect(errors).toHaveLength(0)
  })

  it('fails if not ignore_case and lower case title/branch', async () => {
    const config = fixtureNoIgnoreCase

    const details = pullRequestOpenedFixture(lower_case_good_title_and_branch)
    const errors = await run(
      config,
      details,
      mockGetPRCommitListRequest(good_commits)
    )
    expect(errors).toHaveLength(2)
    expect(errors[0]).toContain('PR title')
    expect(errors[1]).toContain('PR branch')
  })

  it('passes if require_brackets is false and title matches without brackets', async () => {
    const config = fixtureNoBrackets

    const details = pullRequestOpenedFixture(no_brackets_title_and_branch)

    const errors = await run(config, details, noCommitsCallback)
    expect(errors).toHaveLength(0)
  })

  it('fails if require_brackets is true or default and title matches without brackets', async () => {
    const config = fixtureTitle

    const details = pullRequestOpenedFixture(no_brackets_title_and_branch)

    const errors = await run(config, details, noCommitsCallback)
    expect(errors).toHaveLength(1)
  })
})
