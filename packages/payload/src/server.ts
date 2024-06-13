/**
 * WARNING: This file contains exports that can only be safely used on the server.
 */

export { accessOperation } from './auth/operations/access.js' // server-only adjusted
export { forgotPasswordOperation } from './auth/operations/forgotPassword.js' // server-only adjusted

export { loginOperation } from './auth/operations/login.js' // server-only adjusted

export { meOperation } from './auth/operations/me.js' // server-only adjusted

export { refreshOperation } from './auth/operations/refresh.js' // server-only adjusted

export { resetPasswordOperation } from './auth/operations/resetPassword.js' // server-only adjusted

export { loadEnv } from './bin/loadEnv.js' // server-only adjusted

export { createOperation } from './collections/operations/create.js' // server-only adjusted

export { deleteOperation } from './collections/operations/delete.js' // server-only adjusted
export { deleteByIDOperation } from './collections/operations/deleteByID.js' // server-only adjusted

export { updateOperation } from './collections/operations/update.js' // server-only adjusted
export { updateByIDOperation } from './collections/operations/updateByID.js' // server-only adjusted
export { buildConfig } from './config/build.js' // server-only adjusted

export { findConfig } from './config/find.js' // server-only adjusted

export { sanitizeConfig } from './config/sanitize.js' // server-only adjusted

export { createDatabaseAdapter } from './database/createDatabaseAdapter.js' // server-only adjusted

export { createMigration } from './database/migrations/createMigration.js' // server-only adjusted

export { getPredefinedMigration } from './database/migrations/getPredefinedMigration.js' // server-only adjusted
export { migrate } from './database/migrations/migrate.js' // server-only adjusted

export { migrateDown } from './database/migrations/migrateDown.js' // server-only adjusted

export { migrateRefresh } from './database/migrations/migrateRefresh.js' // server-only adjusted

export { migrateReset } from './database/migrations/migrateReset.js' // server-only adjusted

export { migrateStatus } from './database/migrations/migrateStatus.js' // server-only adjusted

export { readMigrationFiles } from './database/migrations/readMigrationFiles.js' // server-only adjusted

export { getFileByPath } from './uploads/getFileByPath.js' // server-only adjusted
export { adminInit } from './utilities/telemetry/events/adminInit.js' // server-only adjusted
