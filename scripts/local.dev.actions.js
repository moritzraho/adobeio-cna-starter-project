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

// todo change this model this should just start the server
// it should not take remoteActions under consideration which is a UI thing
// think about backend only use case how would dev like to develop locally?
async function run () {
  if (config.remoteActions) {
    /**
     * Build && Deploy actions
     */
    await require('./build.actions').buildActions() // async
    require('./deploy.actions') // sync
    // no need to start a server
    // this is simply like a publish command
  } else {
    /**
     * Actions as API
     */
    const app = express()
    app.use(express.json())

    // Make sure zip actions have their dependencies installed
    require('./install.zip.actions.dep') // sync
    app.all(
      '/actions/*',
      ActionRunner
    )
    const port = Number(process.env.PORT || 9080)
    app.listen(port)
    console.log('Serving on port', port)
  }
}

run()
