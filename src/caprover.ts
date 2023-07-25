import * as core from '@actions/core';
import fetch from 'node-fetch'

interface CaproverApps {
  appName: string
  volumes: { volumeName: string }[]
}

export class CapRover {
  private url: string;
  private tokenPromise: Promise<string>;

  constructor(url: string, password: string) {
    this.url = url;
    this.tokenPromise = this.login(password);
  }

  private async login(password: string): Promise<string> {
    try {
      const response = await fetch(`http://${this.url}/api/v2/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({"password": password}),
      });
      const data = await response.json() as { token: string };
      core.setOutput('response', data);
      return data.token;
    } catch (error) {
      core.setFailed(`Failed to create application: ${error.message}`);
      throw error;
    }
  }

  async getTokenOrError() {
    const timeout = new Promise<string>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout waiting for token')), 2 * 60 * 1000) // 2 minutes
    );
    return await Promise.race([this.tokenPromise, timeout]);
  }

  async createApp(appName: string) {
    try {
      const token = await this.getTokenOrError();
      const response = await fetch(`http://${this.url}/api/v2/user/apps/appDefinitions/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-captain-auth': token },
        body: JSON.stringify({"appName": appName, "hasPersistentData": true}),
      });
      const data = await response.json();
      core.setOutput('response', data);
    } catch (error) {
      core.setFailed(`Failed to create application: ${error.message}`);
    }
  }

  async deployApp(appName: string, imageTag: string, imageName?: string) {
    try {
      const token = await this.getTokenOrError();
      const response = await fetch(`http://${this.url}/api/v2/user/apps/appData/${appName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-captain-auth': token },
        body: JSON.stringify({
          "schemaVersion": 2,
          "imageName": `${imageName || appName}:${imageTag}`
      }),
      });
      const data = await response.json();
      core.setOutput('response', data);
    } catch (error) {
      core.setFailed(`Failed to deploy application: ${error.message}`);
    }
  }

  async getApp(appName: string) {
    try {
      const list = await this.getList();
      const app = list.appDefinitions.find(app => app.appName === appName);
      if (!app) {
        throw new Error(`App ${appName} not found.`);
      }
      return app;
    } catch (error) {
      core.setFailed(`Failed to fetch app: ${error.message}`);
    }
    return null;
  }

  async getList(): Promise<{ appDefinitions: CaproverApps[] }> {
    try {
      const token = await this.getTokenOrError();
      const response = await fetch(`http://${this.url}/api/v2/user/apps/appDefinitions`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'x-captain-auth': token },
      });
      const data = await response.json() as { appDefinitions: CaproverApps[] };
      core.setOutput('response', data);
      return data;
    } catch (error) {
      core.setFailed(`Failed to fetch list: ${error.message}`);
    }
    return { appDefinitions: [] }
  }

  async deleteApp(appName: string) {
    try {
      const token = await this.getTokenOrError();
      const app = await this.getApp(appName)
      const response = await fetch(`http://${this.url}/api/v2/user/apps/appDefinitions/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-captain-auth': token },
        body: JSON.stringify({
          appName: appName,
          volumes: app?.volumes?.map(v => v.volumeName)
        })
      });
      const data = await response.json();
      core.setOutput('response', data);
    } catch (error) {
      core.setFailed(`Failed to delete application: ${error.message}`);
    }
  }
}