import * as core from '@actions/core'
import * as gitHub from '@actions/github'
import fetch from 'node-fetch'
import {ENV_PREFIX} from './constant'

interface CaproverApps {
  appName: string
  volumes: {volumeName: string}[]
  instanceCount: number
  captainDefinitionRelativeFilePath: string
  notExposeAsWebApp: boolean
  forceSsl: boolean
  websocketSupport: boolean
  ports: any[]
  description: string
  envVars: {key: string; value: unknown}[]
}

interface Log {
  lines: string[]
  firstLineNumber: number
}

interface AppData {
  isAppBuilding: boolean
  logs: Log
  isBuildFailed: boolean
}

interface ResponseData {
  status: number
  description: string
  data: AppData
}

function join(date: Date, options: any[], separator: string) {
  function format(option: Intl.DateTimeFormatOptions) {
    const formatter = new Intl.DateTimeFormat('en', option)
    return formatter.format(date)
  }
  return options?.map(format).join(separator)
}

export class CapRover {
  private url: string
  private password: string
  private registry?: string
  private githubToken?: string
  private useEnv?: boolean
  constructor(
    url: string,
    password: string,
    registry?: string,
    githubToken?: string,
    useEnv?: boolean
  ) {
    this.url = url
    this.password = password
    this.registry = registry?.endsWith('/') ? registry.slice(0, -1) : registry
    this.githubToken = githubToken
    this.useEnv = useEnv
  }

  private async fetchWithRetry(
    url: string,
    options: any,
    retries: number = 15,
    backoff: number = 300
  ) {
    for (let i = 0; i < retries; i++) {
      try {
        return await fetch(url, options)
      } catch (err: any) {
        if (err.message.includes('Another operation still in progress')) {
          core.info('CapRover is busy, waiting to retry...')
          await new Promise(resolve => setTimeout(resolve, backoff))
          // Exponential backoff
          backoff *= 2
        } else {
          // If it's another error, we throw it
          throw err
        }
      }
    }
    throw new Error('Max retries reached for fetch')
  }

  private async login(password: string): Promise<string> {
    try {
      core.info('Attempting to log in...')
      const response = await this.fetchWithRetry(`${this.url}/api/v2/login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'x-namespace': 'captain'},
        body: JSON.stringify({password: password})
      })
      const data = (await response.json()) as {data: {token: string}}
      core.setOutput('response', data)
      core.info(`Login successful: toke - ${data.data.token} `)
      return data.data.token
    } catch (error: any) {
      core.setFailed(`Failed to log in: ${error.message}`)
      throw error
    }
  }

  async createApp(appName: string, hasPersistentData = false) {
    try {
      const token = await this.login(this.password)
      core.info(`Creating application... ${token}`)
      core.info(
        `Creating application with... ${JSON.stringify({
          appName: appName?.toLowerCase(),
          hasPersistentData
        })}`
      )
      const response = await this.fetchWithRetry(
        `${this.url}/api/v2/user/apps/appDefinitions/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-captain-auth': token,
            'x-namespace': 'captain'
          },
          body: JSON.stringify({
            appName: appName?.toLowerCase(),
            hasPersistentData: true
          })
        }
      )
      const data = await response.text()
      core.setOutput('response', data)
      core.info(`Application created: ${data}`)
    } catch (error: any) {
      core.setFailed(`Failed to create application: ${error.message}`)
    }
  }

  async updateApp(
    appName: string,
    envVars: CaproverApps['envVars'] | null = null,
    additionalOptions: Record<string, unknown> = {}
  ) {
    try {
      const token = await this.login(this.password)
      core.info(`updating application... ${token}`)
      core.info(
        `updating application with... ${JSON.stringify({
          appName: appName?.toLowerCase(),
          hasPersistentData: true
        })}`
      )
      const app = await this.getApp(appName)

      const response = await this.fetchWithRetry(
        `${this.url}/api/v2/user/apps/appDefinitions/update`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-captain-auth': token,
            'x-namespace': 'captain'
          },
          body: JSON.stringify({
            appName: appName,
            instanceCount:
              additionalOptions.instanceCount || app?.instanceCount,
            captainDefinitionRelativeFilePath:
              additionalOptions.captainDefinitionRelativeFilePath ||
              app?.captainDefinitionRelativeFilePath,
            notExposeAsWebApp:
              additionalOptions.notExposeAsWebApp || app?.notExposeAsWebApp,
            forceSsl: additionalOptions.forceSsl || app?.forceSsl,
            websocketSupport:
              additionalOptions.websocketSupport || app?.websocketSupport,
            volumes: additionalOptions.volumes || app?.volumes,
            ports: additionalOptions.ports || app?.ports,
            description: additionalOptions.description || app?.description,
            envVars: {...(app?.envVars || {}), ...(envVars || {})}
          })
        }
      )
      const data = await response.text()
      core.setOutput('response', data)
      core.info(`Application updated: ${data}`)
    } catch (error: any) {
      core.setFailed(`Failed to update application: ${error.message}`)
    }
  }

  async deployApp(
    appName: string,
    imageTag: string,
    imageName?: string,
    hasPersistentData?: boolean
  ) {
    try {
      const token = await this.login(this.password)
      const app = await this.getApp(appName)
      if (!app) {
        await this.createApp(appName, hasPersistentData)
      }
      core.info(`Deploying application... app name: ${appName}`)
      core.info(`Deploying application... with token: ${token}`)
      core.info(
        `Deploying application... image ${`${
          this.registry ? `${this.registry}/` : ''
        }${imageName || appName}:${imageTag}`}`
      )
      let data: any
      try {
        const response = await this.fetchWithRetry(
          `${this.url}/api/v2/user/apps/appData/${appName}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-captain-auth': token,
              'x-namespace': 'captain'
            },
            body: JSON.stringify({
              captainDefinitionContent: JSON.stringify({
                schemaVersion: 2,
                imageName: `${this.registry ? `${this.registry}/` : ''}${
                  imageName || appName
                }:${imageTag}`?.toLowerCase()
              }),
              gitHash: ''
            })
          }
        )
        const dataText = await response.text()

        try {
          data = JSON.parse(dataText)
        } catch (error: any) {
          core.debug(error.message)
        }
      } catch (error) {
        let isAppBuilding = true
        let isBuildFailed = false
        let output: ResponseData | null = null

        while (isAppBuilding && !isBuildFailed) {
          // Pause for a few seconds
          await new Promise(resolve => setTimeout(resolve, 5000))

          // Check build status
          const response = await fetch(
            `${this.url}/api/v2/user/apps/appData/${appName}`,
            {
              headers: {
                'Content-Type': 'application/json',
                'x-captain-auth': token,
                'x-namespace': 'captain'
              },
              method: 'GET'
            }
          )

          const responseData = (await response.json()) as ResponseData

          isAppBuilding = responseData.data.isAppBuilding
          isBuildFailed = responseData.data.isBuildFailed
          output = responseData
        }

        if (isBuildFailed) {
          core.setFailed(`Failed to deploy application: ${output?.description}`)
          core.setFailed(`Request body: ${JSON.stringify(output)}`)
        }

        data = {
          ...output,
          status: 200
        }
      }

      if (data?.status === 100 || data?.status === 200) {
        if (this.useEnv === true) {
          const envToUse = this.useEnv
            ? Object.entries(process.env)
                ?.filter(([key]) => {
                  const val = key.startsWith(ENV_PREFIX)
                  if (!val) {
                    core.info(`excluding env key ${key}`)
                  } else {
                    core.info(`allowing env key ${key}`)
                  }
                  return val
                })
                .map(([key, value]) => ({
                  key: key.replace(ENV_PREFIX, ''),
                  value
                })) || []
            : []
          await this.updateApp(appName, envToUse)
        }
        core.setOutput('response', data)
        core.info(`Application deployed: ${data}`)
        core.debug(`Deployment context: ${gitHub.context.eventName}`)
        if (gitHub.context.eventName === 'pull_request') {
          if (typeof this.githubToken != 'string') {
            core.info('Github token is invalid')
            return
          }

          if (!this.githubToken) {
            core.info('GITHUB_TOKEN is required to update PR')
            return
          }
          core.debug(`Authing with Octokit`)
          try {
            const octokit = gitHub.getOctokit(process.env.GITHUB_TOKEN || '')

            // Fetch the PR's comments
            const commentsResponse = await octokit.rest.issues.listComments({
              issue_number: gitHub.context.issue.number,
              repo: gitHub.context.repo.repo,
              owner: gitHub.context.repo.owner
            })
            const comments = commentsResponse.data

            const base64Context = Buffer.from(
              JSON.stringify(gitHub.context),
              'utf8'
            ).toString('base64')

            // Find the comment that we want to update
            const botComment = comments.find(comment =>
              comment.body?.includes(base64Context)
            )

            // Format the current date
            const options = [
              {day: 'numeric'},
              {month: 'short'},
              {year: 'numeric'},
              {timeStyle: 'medium'}
            ]
            const formattedDate = join(new Date(), options, ' ')

            const baseComment = `
            [tmtv-caprover]: ${base64Context}
            **The latest updates on your projects**. Brought to you by [Three Media Caprover github action](https://three-media.tv/)
            
            | Name | Preview | Updated (UTC) |
            | :--- | :------ | :------ |
              `
            // New comment body
            let newCommentBody = botComment?.body || baseComment

            // Check if app name exists in the table
            if (newCommentBody.includes(`| **${appName}** |`)) {
              // If it does, replace the corresponding row
              const regex = new RegExp(
                `\\| \\*\\*${appName}\\*\\* \\| \\[Visit Preview\\]\\([^\\)]+\\) \\| .+ \\|`,
                'g'
              )
              newCommentBody = newCommentBody.replace(
                regex,
                `| **${appName}** | [Visit Preview](${this.url.replace(
                  'captain',
                  appName
                )}) | ${formattedDate} |`
              )
            } else {
              // If it doesn't, add a new row to the table
              newCommentBody += `
          | **${appName}** | [Visit Preview](${this.url.replace(
                'captain',
                appName
              )}) | ${formattedDate} |`
            }

            // If the bot's comment already exists, update it
            if (botComment) {
              await octokit.rest.issues.updateComment({
                comment_id: botComment.id,
                owner: gitHub.context.repo.owner,
                repo: gitHub.context.repo.repo,
                body: newCommentBody
              })
            } else {
              // Otherwise, create a new comment
              await octokit.rest.issues.createComment({
                issue_number: gitHub.context.issue.number,
                repo: gitHub.context.repo.repo,
                owner: gitHub.context.repo.owner,
                body: newCommentBody
              })
            }

            core.debug('Comment left on PR')
          } catch (error: any) {
            core.debug(error?.message)
          }
        }
      } else {
        core.setFailed(`Failed to deploy application: ${data?.description}`)
      }
    } catch (error: any) {
      core.setFailed(`Failed to deploy application: ${error.message}`)
    }
  }

  async getApp(appName: string) {
    try {
      core.info('Fetching application...')
      const list = await this.getList()
      const app = list.appDefinitions?.find(app => app.appName === appName)
      if (!app) {
        return null
      }
      core.info('Application fetched')
      return app
    } catch (error: any) {
      core.setFailed(`Failed to fetch app: ${error.message}`)
    }
    return null
  }

  async getList(): Promise<{appDefinitions: CaproverApps[]}> {
    try {
      core.info('Fetching list of applications...')
      const token = await this.login(this.password)
      const response = await this.fetchWithRetry(
        `${this.url}/api/v2/user/apps/appDefinitions`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-captain-auth': token,
            'x-namespace': 'captain'
          }
        }
      )
      const data = (await response.json()) as {
        data: {appDefinitions: CaproverApps[]}
      }
      core.setOutput('response', data)
      core.info('List of applications fetched')
      return data.data
    } catch (error: any) {
      core.setFailed(`Failed to fetch list: ${error.message}`)
    }
    return {appDefinitions: []}
  }

  async deleteApp(appName: string) {
    try {
      const token = await this.login(this.password)
      const app = await this.getApp(appName)
      core.info('Deleting application...')
      const response = await this.fetchWithRetry(
        `${this.url}/api/v2/user/apps/appDefinitions/delete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-captain-auth': token,
            'x-namespace': 'captain'
          },
          body: JSON.stringify({
            appName: appName,
            volumes: app?.volumes?.map(v => v.volumeName)
          })
        }
      )
      const data = await response.text()
      core.setOutput('response', data)
      core.info('Application deleted')
    } catch (error: any) {
      core.setFailed(`Failed to delete application: ${error.message}`)
    }
  }
}
