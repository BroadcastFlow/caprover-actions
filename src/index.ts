import * as core from '@actions/core'
import {CapRover} from './caprover'

async function run() {
  try {
    const capRoverUrl = core.getInput('caprover_url', {required: true})
    const password = core.getInput('caprover_password', {required: true})
    const appName = core.getInput('app_name', {required: true})
    const imageName = core.getInput('image_name', {required: false})
    const imageTag = core.getInput('image_tag', {required: true})
    const operation = core.getInput('operation', {required: true})

    const caprover = new CapRover(capRoverUrl, password)

    switch (operation) {
      case 'create':
        await caprover.createApp(appName)
        break
      case 'deploy':
        await caprover.deployApp(appName, imageTag, imageName)
        break
      case 'cleanup':
        await caprover.deleteApp(appName)
        break
      default:
        core.setFailed(`Invalid operation: ${operation}`)
    }
  } catch (error: any) {
    core.setFailed(error?.message)
  }
}

run()
