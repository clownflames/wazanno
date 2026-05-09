import {
    integer,
    pgTable,
    varchar,
    text,
    timestamp
} from "drizzle-orm/pg-core"





/* =========================
   USERS
========================= */

export const usersTable = pgTable(
    "users",
    {
        id: integer()
            .primaryKey()
            .generatedAlwaysAsIdentity(),

        name: varchar({
            length: 255
        }).notNull(),

        age: integer().notNull(),

        email: varchar({
            length: 255
        })
            .notNull()
            .unique(),

        password: varchar({
            length: 500
        }).notNull(),

        created_at: timestamp()
            .defaultNow()
    }
)





/* =========================
   WHATSAPP ACCOUNTS
========================= */

export const whatsappaccounttable = pgTable(
    "whatsapp_accounts",
    {
        id: integer()
            .primaryKey()
            .generatedAlwaysAsIdentity(),

        // Owner user
        userid: integer()
            .references(
                () => usersTable.id,
                {
                    onDelete: "cascade"
                }
            )
            .notNull(),

        // WhatsApp Business Number
        phone_no: varchar({
            length: 20
        }).notNull(),

        // Meta Phone Number ID
        phone_id: varchar({
            length: 255
        }).notNull(),

        // Permanent Token
        whatsapp_token: text()
            .notNull(),

        // Webhook Verify Token
        webhook_verify_token: varchar({
            length: 400
        }).notNull(),

        // Meta App Secret
        meta_app_secret: varchar({
            length: 500
        }).notNull(),

        // Optional Account Name
        account_name: varchar({
            length: 255
        }),

        created_at: timestamp()
            .defaultNow()
    }
)





/* =========================
   MESSAGES
========================= */

export const messagesTable = pgTable(
    "messages",
    {
        id: integer()
            .primaryKey()
            .generatedAlwaysAsIdentity(),

        // WhatsApp account
        whatsapp_account_id: integer()
            .references(
                () => whatsappaccounttable.id,
                {
                    onDelete: "cascade"
                }
            )
            .notNull(),

        // Sender WhatsApp Number
        sender_no: varchar({
            length: 30
        }).notNull(),

        // Receiver WhatsApp Number
        receiver_no: varchar({
            length: 30
        }).notNull(),

        // Message ID from Meta
        meta_message_id: varchar({
            length: 255
        }),

        // Message type
        message_type: varchar({
            length: 50
        }).default("text"),

        // Message text
        content: text(),

        // sent | delivered | read | failed
        status: varchar({
            length: 50
        }).default("sent"),

        created_at: timestamp()
            .defaultNow()
    }
)