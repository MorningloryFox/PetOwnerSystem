CREATE TABLE "appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"pet_id" uuid NOT NULL,
	"service_id" uuid NOT NULL,
	"scheduled_date" timestamp NOT NULL,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"address" text,
	"logo" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "companies_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "customer_package_services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_package_id" uuid NOT NULL,
	"service_id" uuid NOT NULL,
	"remaining_uses" integer NOT NULL,
	"total_uses" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_packages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"package_type_id" uuid NOT NULL,
	"remaining_uses" integer NOT NULL,
	"valid_until" timestamp NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"renewed_from_id" uuid,
	"purchase_price" numeric(10, 2) NOT NULL,
	"acquired_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"notes" text,
	"address" text,
	"cep" text,
	"city" text,
	"state" text,
	"neighborhood" text,
	"complement" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"type" text NOT NULL,
	"message" text NOT NULL,
	"channel" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"metadata" jsonb,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "package_type_services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"package_type_id" uuid NOT NULL,
	"service_id" uuid NOT NULL,
	"included_uses" integer DEFAULT 1,
	"unit_price" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "package_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"validity_days" integer NOT NULL,
	"total_uses" integer NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"max_pets" integer DEFAULT 1,
	"active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "package_usages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_package_id" uuid NOT NULL,
	"pet_id" uuid NOT NULL,
	"service_id" uuid NOT NULL,
	"notes" text,
	"used_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"name" text NOT NULL,
	"species" text NOT NULL,
	"breed" text,
	"weight" numeric(5, 2),
	"birth_date" date,
	"gender" text,
	"color" text,
	"special_needs" text,
	"preferred_food" text,
	"notes" text,
	"image_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"base_price" numeric(10, 2),
	"duration" integer,
	"active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"name" text NOT NULL,
	"role" text DEFAULT 'employee' NOT NULL,
	"is_active" boolean DEFAULT true,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_pet_id_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_package_services" ADD CONSTRAINT "customer_package_services_customer_package_id_customer_packages_id_fk" FOREIGN KEY ("customer_package_id") REFERENCES "public"."customer_packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_package_services" ADD CONSTRAINT "customer_package_services_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_packages" ADD CONSTRAINT "customer_packages_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_packages" ADD CONSTRAINT "customer_packages_package_type_id_package_types_id_fk" FOREIGN KEY ("package_type_id") REFERENCES "public"."package_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "package_type_services" ADD CONSTRAINT "package_type_services_package_type_id_package_types_id_fk" FOREIGN KEY ("package_type_id") REFERENCES "public"."package_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "package_type_services" ADD CONSTRAINT "package_type_services_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "package_types" ADD CONSTRAINT "package_types_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "package_usages" ADD CONSTRAINT "package_usages_customer_package_id_customer_packages_id_fk" FOREIGN KEY ("customer_package_id") REFERENCES "public"."customer_packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "package_usages" ADD CONSTRAINT "package_usages_pet_id_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "package_usages" ADD CONSTRAINT "package_usages_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pets" ADD CONSTRAINT "pets_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "unique_email_per_company" ON "users" USING btree ("email","company_id");