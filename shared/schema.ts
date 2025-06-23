import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
});

export const addresses = pgTable("addresses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  label: text("label").notNull(), // "Thuis", "Kantoor", etc.
  street: text("street").notNull(),
  city: text("city").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull().default("Netherlands"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
});

export const drivers = pgTable("drivers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("5.0"),
  vehicle: text("vehicle").notNull(),
  vehicleType: text("vehicle_type").notNull(), // "van", "car", "bike"
  isActive: boolean("is_active").default(true),
  currentLatitude: decimal("current_latitude", { precision: 10, scale: 8 }),
  currentLongitude: decimal("current_longitude", { precision: 11, scale: 8 }),
});

export const deliveries = pgTable("deliveries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  driverId: integer("driver_id").references(() => drivers.id),
  orderNumber: text("order_number").notNull().unique(),
  type: text("type").notNull(), // "package", "letter", "express"
  status: text("status").notNull().default("pending"), // "pending", "assigned", "picked_up", "in_transit", "delivered", "cancelled"
  
  // Pickup details
  pickupAddressId: integer("pickup_address_id").references(() => addresses.id),
  pickupStreet: text("pickup_street").notNull(),
  pickupCity: text("pickup_city").notNull(),
  pickupPostalCode: text("pickup_postal_code").notNull(),
  pickupLatitude: decimal("pickup_latitude", { precision: 10, scale: 8 }),
  pickupLongitude: decimal("pickup_longitude", { precision: 11, scale: 8 }),
  
  // Delivery details
  deliveryAddressId: integer("delivery_address_id").references(() => addresses.id),
  deliveryStreet: text("delivery_street").notNull(),
  deliveryCity: text("delivery_city").notNull(),
  deliveryPostalCode: text("delivery_postal_code").notNull(),
  deliveryLatitude: decimal("delivery_latitude", { precision: 10, scale: 8 }),
  deliveryLongitude: decimal("delivery_longitude", { precision: 11, scale: 8 }),
  
  // Pricing and timing
  estimatedPrice: decimal("estimated_price", { precision: 8, scale: 2 }).notNull(),
  finalPrice: decimal("final_price", { precision: 8, scale: 2 }),
  estimatedDeliveryTime: integer("estimated_delivery_time"), // in minutes
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  pickedUpAt: timestamp("picked_up_at"),
  deliveredAt: timestamp("delivered_at"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertAddressSchema = createInsertSchema(addresses).omit({
  id: true,
});

export const insertDriverSchema = createInsertSchema(drivers).omit({
  id: true,
});

export const insertDeliverySchema = createInsertSchema(deliveries).omit({
  id: true,
  orderNumber: true,
  createdAt: true,
  pickedUpAt: true,
  deliveredAt: true,
}).extend({
  pickupStreet: z.string().min(1, "Pickup address is required"),
  pickupCity: z.string().min(1, "Pickup city is required"),
  pickupPostalCode: z.string().min(1, "Pickup postal code is required"),
  deliveryStreet: z.string().min(1, "Delivery address is required"),
  deliveryCity: z.string().min(1, "Delivery city is required"),
  deliveryPostalCode: z.string().min(1, "Delivery postal code is required"),
  type: z.enum(["package", "letter", "express"]),
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Address = typeof addresses.$inferSelect;
export type InsertAddress = z.infer<typeof insertAddressSchema>;

export type Driver = typeof drivers.$inferSelect;
export type InsertDriver = z.infer<typeof insertDriverSchema>;

export type Delivery = typeof deliveries.$inferSelect;
export type InsertDelivery = z.infer<typeof insertDeliverySchema>;
