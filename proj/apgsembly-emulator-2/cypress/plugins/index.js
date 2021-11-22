/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

// /**
//  * @type {Cypress.PluginConfig}
//  */
// // eslint-disable-next-line no-unused-vars
// module.exports = (on, config) => {
//   // `on` is used to hook into various events Cypress emits
//   // `config` is the resolved Cypress config
// }
export default (on, config) => {
    return config;
}

// module.exports = (on, config) => {
//   // `on` is used to hook into various events Cypress emits
//   // `config` is the resolved Cypress config
// }
// **Title:** Error running plugin

// **Message:** The following error was thrown by a plugin. We stopped running your tests because a plugin crashed. Please check your plugins file (`false`)

// **Stack trace:**
// ```
// Error: The following error was thrown by a plugin. We stopped running your tests because a plugin crashed. Please check your plugins file (`false`)
//     at Object.get (/Users/satoshi/Library/Caches/Cypress/9.0.0/Cypress.app/Contents/Resources/app/packages/server/lib/errors.js:1043:15)
//     at EventEmitter.handleError (/Users/satoshi/Library/Caches/Cypress/9.0.0/Cypress.app/Contents/Resources/app/packages/server/lib/plugins/index.js:189:20)
//     at EventEmitter.emit (node:events:394:28)
//     at ChildProcess.<anonymous> (/Users/satoshi/Library/Caches/Cypress/9.0.0/Cypress.app/Contents/Resources/app/packages/server/lib/plugins/util.js:19:22)
//     at ChildProcess.emit (node:events:394:28)
//     at emit (node:internal/child_process:920:12)
//     at processTicksAndRejections (node:internal/process/task_queues:84:21)

// ```