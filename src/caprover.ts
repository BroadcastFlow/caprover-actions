import * as core from '@actions/core'
import fetch from 'node-fetch'

interface CaproverApps {
  appName: string
  volumes: {volumeName: string}[]
}

export class CapRover {
  private url: string
  private password: string
  constructor(url: string, password: string) {
    this.url = url
    this.password = password
  }

  private async login(password: string): Promise<string> {
    try {
      core.info('Attempting to log in...')
      const response = await fetch(`${this.url}/api/v2/login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'x-namespace': 'captain'},
        body: JSON.stringify({password: password})
      })
      const data = (await response.json()) as {token: string}
      core.setOutput('response', data)
      core.info(`Login successful: toke - ${data.token} `)
      return data.token
    } catch (error: any) {
      core.setFailed(`Failed to log in: ${error.message}`)
      throw error
    }
  }

  async createApp(appName: string) {
    try {
      const token = await this.login(this.password)
      core.info('Creating application...')
      const response = await fetch(
        `${this.url}/api/v2/user/apps/appDefinitions/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-captain-auth': token,
            'x-namespace': 'captain'
          },
          body: JSON.stringify({appName: appName, hasPersistentData: true})
        }
      )
      const data = await response.json()
      core.setOutput('response', data)
      core.info(`Application created: ${JSON.stringify(data)}`)
    } catch (error: any) {
      core.setFailed(`Failed to create application: ${error.message}`)
    }
  }

  async deployApp(appName: string, imageTag: string, imageName?: string) {
    try {
      const token = await this.login(this.password)
      const app = await this.getApp(appName)
      if (!app) {
        await this.createApp(appName)
      }
      core.info('Deploying application...')
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
            schemaVersion: 2,
            imageName: `${imageName || appName}:${imageTag}`
          })
        }
      )
      const data = await response.json()
      core.setOutput('response', data)
      core.info(`Application deployed: ${JSON.stringify(data)}`)
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
      const data = (await response.json()) as {appDefinitions: CaproverApps[]}
      core.setOutput('response', data)
      core.info('List of applications fetched')
      return data
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
      const data = await response.json()
      core.setOutput('response', data)
      core.info('Application deleted')
    } catch (error: any) {
      core.setFailed(`Failed to delete application: ${error.message}`)
    }
  }
}
