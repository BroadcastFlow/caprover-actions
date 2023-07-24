import * as core from '@actions/core';

export class CapRover {
  private url: string;
  private password: string;

  constructor(url: string, password: string) {
    this.url = url;
    this.password = password;
  }

  async createApp(appName: string) {
    try {
      const response = await fetch(`http://${this.url}/app/register/${appName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: this.password }),
      });
      const data = await response.json();
      core.setOutput('response', data);
    } catch (error) {
      core.setFailed(`Failed to create application: ${error.message}`);
    }
  }

  async deployApp(appName: string, imageTag: string) {
    try {
      const response = await fetch(`http://${this.url}/app/deploy/${appName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: this.password,
          imageTag: imageTag,
        }),
      });
      const data = await response.json();
      core.setOutput('response', data);
    } catch (error) {
      core.setFailed(`Failed to deploy application: ${error.message}`);
    }
  }

  async deleteApp(appName: string) {
    try {
      const response = await fetch(`http://${this.url}/app/delete/${appName}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: this.password }),
      });
      const data = await response.json();
      core.setOutput('response', data);
    } catch (error) {
      core.setFailed(`Failed to delete application: ${error.message}`);
    }
  }
}
