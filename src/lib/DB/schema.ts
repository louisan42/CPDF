import {integer, pgEnum, pgTable, serial, text, timestamp, varchar} from 'drizzle-orm/pg-core'

export const userSystemEnum = pgEnum('user_system_enum', ['system', 'user'])

export const chats = pgTable('chats', {
    id: serial('id').primaryKey(),
    pdf_name: text('pdf_name').notNull(),
    pdfUrl: text('pdf_url').notNull(),
    created_at: timestamp('created_at').notNull().defaultNow(),
    userId: varchar('user_id',{length:256}).notNull(),
    fileKey: text('file_key').notNull(),
})


export const messages = pgTable('messages', {
    id: serial('id').primaryKey(),
    message: text('message').notNull(),
    created_at: timestamp('created_at').notNull().defaultNow(),
    chatId: integer('chat_id').references(()=>chats.id).notNull(),
    role: userSystemEnum('role').notNull().default('user'),
})