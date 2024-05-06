export interface InputConfig {
  projects: string[]
  check_title: boolean
  check_branch: boolean
  check_commits: boolean
  ignore_case: boolean
  require_brackets: boolean
}

export interface PullRequestDetails {
  owner: string
  repo: string
  title: string
  branch: string
  number: number
}

export type FetchCommits = (
  owner: string,
  repo: string,
  pull_number: number
) => Promise<string[]>

function createProjectRegex(project: string, ignoreCase = false): RegExp {
  return new RegExp(`${project}[-_]\\d*`, ignoreCase ? 'i' : undefined)
}

function createWrappedProjectRegex(
  project: string,
  requireBrackets = false
): RegExp {
  if (requireBrackets) {
    return new RegExp(`\\[${project}-\\d*\\]`)
  }
  return new RegExp(`${project}[-_]\\d*`)
}

export async function run(
  config: InputConfig,
  details: PullRequestDetails,
  fetchCommits: FetchCommits
): Promise<string[]> {
  const title = config.ignore_case ? details.title.toLowerCase() : details.title

  const head_branch = config.ignore_case
    ? details.branch.toLowerCase()
    : details.branch

  const errors = []

  const projects = config.projects.map(project =>
    config.ignore_case ? project.toLowerCase() : project
  )
  if (config.check_title) {
    // check the title matches [PROJECT-1234] somewhere
    if (
      !projects.some(project =>
        title.match(createWrappedProjectRegex(project, config.require_brackets))
      )
    ) {
      errors.push(
        `PR title ${title} does not contain approved project with format [PROJECT-1234]`
      )
    }
  }

  // check the branch matches PROJECT-1234 or PROJECT_1234 somewhere
  if (config.check_branch) {
    if (
      !projects.some(project => head_branch.match(createProjectRegex(project)))
    ) {
      errors.push(
        `PR branch ${head_branch} does not contain an approved project with format PROJECT-1234 or PROJECT_1234`
      )
    }
  }

  // check the branch matches PROJECT-1234 or PROJECT_1234 somewhere
  if (config.check_commits) {
    const commitsInPR = await fetchCommits(
      details.owner,
      details.repo,
      details.number
    )
    const firstCommit = commitsInPR[0]
    const failed = !projects.some(project =>
      firstCommit.match(createProjectRegex(project, config.ignore_case))
    )

    if (failed) {
      errors.push(
        `First commit message '${firstCommit}' does not contain an approved project`
      )
    }
  }

  return errors
}
