import * as core from '@actions/core'
import {CapRover} from './caprover'

async function run() {
  try {
    core.info('Starting the CapRover GitHub action...')

    const capRoverUrl = core.getInput('caprover_url', {required: true})
    const password = core.getInput('caprover_password', {required: true})
    const appName = core.getInput('app_name', {required: true})
    const imageName = core.getInput('image_name', {required: false})
    const imageTag = core.getInput('image_tag', {required: true})
    const operation = core.getInput('operation', {required: true})
    const registry = core.getInput('docker_registry', {required: false})
    const useEnv = core.getInput('useEnv', {required: false})
    const additionalUpdateSettings = core.getInput('additionalUpdateSettings', {
      required: false
    })
    const github_token = (process.env['GITHUB_TOKEN'] || '').trim()

    core.info(`Operation: ${operation}`)
    core.info(`Application name: ${appName}`)
    core.info(`Image name: ${imageName}`)
    core.info(`Image tag: ${imageTag}`)

    const caprover = new CapRover(
      capRoverUrl,
      password,
      registry,
      github_token,
      Boolean(useEnv)
    )

    switch (operation) {
      case 'create':
        core.info('Creating application...')
        await caprover.createApp(appName)
        break
      case 'deploy':
        core.info('Deploying application...')
        await caprover.deployApp(appName, imageTag, imageName)
        break
      case 'update':
        core.info('updating application...')
        const envToUse = Boolean(useEnv)
          ? Object.entries(process.env).map(([key, value]) => ({key, value}))
          : undefined
        const settings = additionalUpdateSettings
          ? JSON.parse(additionalUpdateSettings)
          : {}
        await caprover.updateApp(appName, envToUse, settings)
        break
      case 'cleanup':
        core.info('Deleting application...')
        await caprover.deleteApp(appName)
        break
      default:
        core.setFailed(`Invalid operation: ${operation}`)
    }
    core.info('Finished the CapRover GitHub action')
  } catch (error: any) {
    core.setFailed(error?.message)
  }
}

run()
