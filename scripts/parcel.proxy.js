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
/**
 * Proxy server for client dev
 */
const Bundler = require('parcel-bundler')
const express = require('express')
const ActionRunner = require('./runner')

const config = require('./script.config')
const open = require('open')

async function run () {
  /**
   * Generate Config
   */
  require('./generate.config')

  /**
   * Make sure zip actions have their dependencies installed
   */
  require('./install.zip.actions.dep')

  const app = express()

  app.use(express.json())

  if (config.remoteActions) {
    /**
    * Build && Deploy actions
    */

    await require('./build.actions').buildActions() // async
    require('./deploy.actions') // sync
  } else {
    /**
    * Actions as API
    */
    app.all(
      '/actions/*',
      ActionRunner
    )
  }

  const bundler = new Bundler('web-src/index.html', {
    cache: false,
    outDir: config.distUILocalDir,
    contentHash: false,
    watch: true
  })
  app.use(bundler.middleware())
  const port = Number(process.env.PORT || 9000)
  app.listen(port)

  open(`http://localhost:${port}`)

  console.log('Serving on port', port)
}

run()
