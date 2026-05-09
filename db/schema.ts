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
            .defaultNow(),


             // Media related fields
        media_id: varchar({
            length: 255
        }), // Meta media ID
        
        media_url: text(), // URL to fetch media
        
        media_type: varchar({
            length: 50
        }), // image, video, audio, document, etc.
        
        mime_type: varchar({
            length: 100
        }), // image/jpeg, video/mp4, etc.
        
        caption: text(), // Caption for media
        
        filename: varchar({
            length: 255
        }), // Original filename for documents
        
        // Location data
        latitude: varchar({
            length: 50
        }),
        
        longitude: varchar({
            length: 50
        }),
        
        location_name: text(),
        location_address: text(),
        
        // Contact data
        contact_name: varchar({
            length: 255
        }),
        contact_phone: varchar({
            length: 50
        }),
        
        // Interactive/Reaction data
        interactive_data: text(), // JSON string
        reaction_emoji: varchar({
            length: 10
        }),
        reacts_to_message_id: varchar({
            length: 255
        }),
        
        // System/Order data
        system_data: text(),
        order_data: text(),
        
        updated_at: timestamp()
            .defaultNow()








    }
)