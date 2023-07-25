import * as core from '@actions/core'
import * as gitHub from '@actions/github'
import fetch from 'node-fetch'

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

export class CapRover {
  private url: string
  private password: string
  private registry?: string
  constructor(url: string, password: string, registry?: string) {
    this.url = url
    this.password = password
    this.registry = registry?.endsWith('/') ? registry.slice(0, -1) : registry
  }

  private async login(password: string): Promise<string> {
    try {
      core.info('Attempting to log in...')
      const response = await fetch(`${this.url}/api/v2/login`, {
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

  async createApp(appName: string) {
    try {
      const token = await this.login(this.password)
      core.info(`Creating application... ${token}`)
      core.info(
        `Creating application with... ${JSON.stringify({
          appName: appName?.toLowerCase(),
          hasPersistentData: true
        })}`
      )
      const response = await fetch(
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
      const response = await fetch(
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
            envVars: envVars !== undefined ? envVars : app?.envVars
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

  async deployApp(appName: string, imageTag: string, imageName?: string) {
    try {
      const token = await this.login(this.password)
      const app = await this.getApp(appName)
      if (!app) {
        await this.createApp(appName)
      }
      core.info(`Deploying application... app name: ${appName}`)
      core.info(`Deploying application... with token: ${token}`)
      core.info(
        `Deploying application... image ${`${
          this.registry ? `${this.registry}/` : ''
        }${imageName || appName}:${imageTag}`}`
      )
      const response = await fetch(
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
      const data = (await response.json()) as Record<string, undefined>

      if (data.status === 100 || data.status === 200) {
        if (gitHub.context.eventName === 'pull_request') {
          const octokit = gitHub.getOctokit(process.env.GITHUB_TOKEN || '')
          const date = new Date()

          function join(date: Date, options: any[], separator: string) {
            function format(option: Intl.DateTimeFormatOptions) {
              const formatter = new Intl.DateTimeFormat('en', option)
              return formatter.format(date)
            }
            return options?.map(format).join(separator)
          }

          const options = [
            {day: 'numeric'},
            {month: 'short'},
            {year: 'numeric'},
            {timeStyle: 'medium'}
          ]

          octokit.rest.issues.createComment({
            issue_number: gitHub.context.issue.number,
            repo: gitHub.context.issue.repo,
            owner: gitHub.context.issue.owner,
            body: `
            **The latest updates on your projects**. Brought to you by [Three Media Caprover github action](https://three-media.tv/)

            | Name | Preview | Updated (UTC) |
            | :--- | :------ | :------ |
            | **${appName}** | [Visit Preview](${this.url.replace(
              'captain',
              appName
            )}) | ${join(new Date(), options, ' ')} |
            `
          })
        }
      } else {
        core.setFailed(`Failed to deploy application: ${data.description}`)
      }

      core.setOutput('response', data)
      core.info(`Application deployed: ${data}`)
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
      const response = await fetch(
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
      const response = await fetch(
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
