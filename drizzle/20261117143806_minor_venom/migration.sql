CREATE TYPE "listing_status" AS ENUM('For Sale', 'For Rent');--> statement-breakpoint
CREATE TYPE "order_status" AS ENUM('PENDING', 'SUCCESS', 'FAILED');--> statement-breakpoint
CREATE TYPE "reservation_status" AS ENUM('pending', 'active', 'expired', 'cancelled');--> statement-breakpoint
CREATE TYPE "appointment_status" AS ENUM('booked', 'cancelled');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY,
	"token" text NOT NULL UNIQUE,
	"expires_at" timestamp with time zone NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"phone" text UNIQUE,
	"role" text DEFAULT 'user' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "houses" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"status" "listing_status" NOT NULL,
	"location" text NOT NULL,
	"price" integer NOT NULL,
	"currency" text DEFAULT 'ETB' NOT NULL,
	"sqft" integer NOT NULL,
	"bedrooms" integer NOT NULL,
	"bathrooms" integer NOT NULL,
	"garage" text,
	"year_built" integer,
	"published" boolean DEFAULT true NOT NULL,
	"lot_size" text,
	"description" text,
	"features" text[] DEFAULT '{}'::text[] NOT NULL,
	"thumb" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"merchant_reference" text NOT NULL UNIQUE,
	"user_id" text NOT NULL,
	"reservation_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'ETB' NOT NULL,
	"status" "order_status" DEFAULT 'PENDING'::"order_status" NOT NULL,
	"customer_email" text NOT NULL,
	"chapa_reference" text,
	"checkout_url" text,
	"payment_method" text,
	"service_fee" integer,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" text NOT NULL,
	"house_id" text NOT NULL,
	"days" integer NOT NULL,
	"status" "reservation_status" DEFAULT 'pending'::"reservation_status" NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reservations_days_check" CHECK ("days" between 1 and 14)
);
--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" text NOT NULL,
	"house_id" text,
	"date" text NOT NULL,
	"time" text NOT NULL,
	"topic" text NOT NULL,
	"note" text,
	"status" "appointment_status" DEFAULT 'booked'::"appointment_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "house_rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"house_id" text NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"panorama_key" text NOT NULL,
	"mask_key" text,
	"start_pitch" double precision,
	"start_yaw" double precision,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "room_hotspots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"room_id" uuid NOT NULL,
	"to_slug" text NOT NULL,
	"label" text NOT NULL,
	"pitch" double precision NOT NULL,
	"yaw" double precision NOT NULL
);
--> statement-breakpoint
CREATE INDEX "orders_user_idx" ON "orders" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "one_active_reservation_per_house" ON "reservations" ("house_id") WHERE "status" = 'active';--> statement-breakpoint
CREATE INDEX "reservations_user_idx" ON "reservations" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "one_booking_per_slot" ON "appointments" ("date","time") WHERE "status" = 'booked';--> statement-breakpoint
CREATE INDEX "appointments_user_idx" ON "appointments" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "room_slug_per_house" ON "house_rooms" ("house_id","slug");--> statement-breakpoint
CREATE INDEX "hotspots_room_idx" ON "room_hotspots" ("room_id");--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_reservation_id_reservations_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_house_id_houses_id_fkey" FOREIGN KEY ("house_id") REFERENCES "houses"("id");--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_house_id_houses_id_fkey" FOREIGN KEY ("house_id") REFERENCES "houses"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "house_rooms" ADD CONSTRAINT "house_rooms_house_id_houses_id_fkey" FOREIGN KEY ("house_id") REFERENCES "houses"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "room_hotspots" ADD CONSTRAINT "room_hotspots_room_id_house_rooms_id_fkey" FOREIGN KEY ("room_id") REFERENCES "house_rooms"("id") ON DELETE CASCADE;