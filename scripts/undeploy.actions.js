/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
const fs = require('fs')
const childProcess = require('child_process')
const config = require('./script.config')

function undeployActionsSync () {
  if (!fs.existsSync(config.distWskManifestFile) || !fs.statSync(config.distWskManifestFile).isFile()) {
    throw new Error('Cannot undeploy actions, seems like they are not deployed?')
  }

  console.log(`Undeploying actions...`)

  // for now this is a tmp hack so that ~/.wskprops does not interfer with WHISK_* properties defined in .env
  const fakeWskProps = '.fake-wskprops'
  fs.writeFileSync(fakeWskProps, '')
  process.env['WSK_CONFIG_FILE'] = fakeWskProps

  // aio reads env WHISK_* properties
  const aio = childProcess.spawnSync(
    `aio`,
    [
      'runtime', 'deploy',
      'undeploy', '-i',
      '-m', config.distWskManifestFile
    ],
    { cwd: config.rootDir }
  )
  if (aio.error) throw aio.error
  if (aio.status !== 0) throw new Error(aio.stderr.toString())

  // hack end remove fake props file
  fs.unlinkSync(fakeWskProps)

  // rm config.distWskManifestFile
  fs.unlinkSync(config.distWskManifestFile)

  Object.keys(config.wskManifestActions).forEach(an => {
    console.log(`  -> ${config.owDeploymentPackage}/${an}`)
  })
}

try {
  undeployActionsSync()
  console.log('Succesfully undeployed actions!')
} catch (e) {
  console.error(e)
}
