ALTER TABLE "messages" ADD COLUMN "media_id" varchar(255);--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "media_url" text;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "media_type" varchar(50);--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "mime_type" varchar(100);--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "caption" text;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "filename" varchar(255);--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "latitude" varchar(50);--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "longitude" varchar(50);--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "location_name" text;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "location_address" text;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "contact_name" varchar(255);--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "contact_phone" varchar(50);--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "interactive_data" text;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "reaction_emoji" varchar(10);--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "reacts_to_message_id" varchar(255);--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "system_data" text;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "order_data" text;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "updated_at" timestamp DEFAULT now();