import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

// Users table
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Workspaces table
export const workspaces = sqliteTable('workspaces', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Datasets table
export const datasets = sqliteTable('datasets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  workspaceId: integer('workspace_id').notNull().references(() => workspaces.id),
  name: text('name').notNull(),
  filePath: text('file_path'),
  fileSize: integer('file_size'),
  rowCount: integer('row_count'),
  columnCount: integer('column_count'),
  columnsJson: text('columns_json', { mode: 'json' }),
  uploadedAt: text('uploaded_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// ML Models table
export const mlModels = sqliteTable('ml_models', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  workspaceId: integer('workspace_id').notNull().references(() => workspaces.id),
  datasetId: integer('dataset_id').references(() => datasets.id),
  modelName: text('model_name').notNull(),
  algorithmType: text('algorithm_type').notNull(),
  targetColumn: text('target_column').notNull(),
  featureColumnsJson: text('feature_columns_json', { mode: 'json' }),
  modelFilePath: text('model_file_path'),
  accuracy: real('accuracy'),
  precisionScore: real('precision_score'),
  recallScore: real('recall_score'),
  f1Score: real('f1_score'),
  confusionMatrixJson: text('confusion_matrix_json', { mode: 'json' }),
  trainingDuration: integer('training_duration'),
  isSelected: integer('is_selected', { mode: 'boolean' }).default(false),
  trainedAt: text('trained_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Training History table
export const trainingHistory = sqliteTable('training_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  mlModelId: integer('ml_model_id').notNull().references(() => mlModels.id),
  epochNumber: integer('epoch_number').notNull(),
  lossValue: real('loss_value'),
  accuracyValue: real('accuracy_value'),
  createdAt: text('created_at').notNull(),
});

// NLU Models table
export const nluModels = sqliteTable('nlu_models', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  workspaceId: integer('workspace_id').notNull().references(() => workspaces.id),
  name: text('name').notNull(),
  rasaModelPath: text('rasa_model_path'),
  intentsJson: text('intents_json', { mode: 'json' }),
  entitiesJson: text('entities_json', { mode: 'json' }),
  trainingDataPath: text('training_data_path'),
  accuracy: real('accuracy'),
  trainedAt: text('trained_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Annotations table
export const annotations = sqliteTable('annotations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nluModelId: integer('nlu_model_id').notNull().references(() => nluModels.id),
  text: text('text').notNull(),
  intent: text('intent'),
  entitiesJson: text('entities_json', { mode: 'json' }),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Chat Sessions table
export const chatSessions = sqliteTable('chat_sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  workspaceId: integer('workspace_id').notNull().references(() => workspaces.id),
  nluModelId: integer('nlu_model_id').references(() => nluModels.id),
  startedAt: text('started_at').notNull(),
  endedAt: text('ended_at'),
});

// Chat Messages table
export const chatMessages = sqliteTable('chat_messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  chatSessionId: integer('chat_session_id').notNull().references(() => chatSessions.id),
  messageText: text('message_text').notNull(),
  isUser: integer('is_user', { mode: 'boolean' }).notNull(),
  intentDetected: text('intent_detected'),
  confidenceScore: real('confidence_score'),
  createdAt: text('created_at').notNull(),
});