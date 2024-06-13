/* eslint-disable no-param-reassign */
import type { MarkOptional } from 'ts-essentials'

import type {
  BaseDatabaseAdapter,
  BeginTransaction,
  CommitTransaction,
  RollbackTransaction,
} from '../bundle.js'

import {
  createMigration,
  migrate,
  migrateDown,
  migrateRefresh,
  migrateReset,
  migrateStatus,
} from '../server.js'

const beginTransaction: BeginTransaction = async () => null
const rollbackTransaction: RollbackTransaction = async () => null
const commitTransaction: CommitTransaction = async () => null

export function createDatabaseAdapter<T extends BaseDatabaseAdapter>(
  args: MarkOptional<
    T,
    | 'createMigration'
    | 'migrate'
    | 'migrateDown'
    | 'migrateFresh'
    | 'migrateRefresh'
    | 'migrateReset'
    | 'migrateStatus'
    | 'migrationDir'
  >,
): T {
  return {
    // Default 'null' transaction functions
    beginTransaction,
    commitTransaction,
    createMigration,
    migrate,
    migrateDown,
    migrateFresh: async ({ forceAcceptWarning = null }) => null,
    migrateRefresh,
    migrateReset,
    migrateStatus,
    rollbackTransaction,

    ...args,

    // Ensure migrationDir is set
    migrationDir: args.migrationDir || 'migrations',
  } as T
}
