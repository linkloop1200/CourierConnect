import { users, addresses, drivers, deliveries, type User, type InsertUser, type Address, type InsertAddress, type Driver, type InsertDriver, type Delivery, type InsertDelivery } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Addresses
  getAddress(id: number): Promise<Address | undefined>;
  getAddressesByUserId(userId: number): Promise<Address[]>;
  createAddress(address: InsertAddress): Promise<Address>;
  
  // Drivers
  getDriver(id: number): Promise<Driver | undefined>;
  getAvailableDrivers(): Promise<Driver[]>;
  createDriver(driver: InsertDriver): Promise<Driver>;
  updateDriverLocation(id: number, latitude: string, longitude: string): Promise<Driver | undefined>;
  
  // Deliveries
  getDelivery(id: number): Promise<Delivery | undefined>;
  getDeliveriesByUserId(userId: number): Promise<Delivery[]>;
  getDeliveriesByDriverId(driverId: number): Promise<Delivery[]>;
  createDelivery(delivery: InsertDelivery): Promise<Delivery>;
  updateDeliveryStatus(id: number, status: string, driverId?: number): Promise<Delivery | undefined>;
  updateDeliveryPickupTime(id: number): Promise<Delivery | undefined>;
  updateDeliveryDeliveredTime(id: number): Promise<Delivery | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private addresses: Map<number, Address>;
  private drivers: Map<number, Driver>;
  private deliveries: Map<number, Delivery>;
  private currentUserId: number;
  private currentAddressId: number;
  private currentDriverId: number;
  private currentDeliveryId: number;

  constructor() {
    this.users = new Map();
    this.addresses = new Map();
    this.drivers = new Map();
    this.deliveries = new Map();
    this.currentUserId = 1;
    this.currentAddressId = 1;
    this.currentDriverId = 1;
    this.currentDeliveryId = 1;
    
    this.initializeData();
  }

  private initializeData() {
    // Create a test user
    const testUser: User = {
      id: 1,
      username: "testuser",
      password: "password",
      fullName: "Jan Smit",
      email: "jan@example.com",
      phone: "+31612345678"
    };
    this.users.set(1, testUser);
    this.currentUserId = 2;

    // Create test addresses
    const homeAddress: Address = {
      id: 1,
      userId: 1,
      label: "Thuis",
      street: "Keizersgracht 123",
      city: "Amsterdam",
      postalCode: "1015 CJ",
      country: "Netherlands",
      latitude: "52.3676",
      longitude: "4.9041"
    };
    
    const workAddress: Address = {
      id: 2,
      userId: 1,
      label: "Kantoor",
      street: "Vondelpark 45",
      city: "Amsterdam",
      postalCode: "1071 AA",
      country: "Netherlands",
      latitude: "52.3580",
      longitude: "4.8690"
    };
    
    this.addresses.set(1, homeAddress);
    this.addresses.set(2, workAddress);
    this.currentAddressId = 3;

    // Create test drivers
    const testDriver: Driver = {
      id: 1,
      name: "Marco van der Berg",
      phone: "+31687654321",
      email: "marco@spoedpakketjes.nl",
      rating: "4.8",
      vehicle: "Toyota Hiace",
      vehicleType: "van",
      isActive: true,
      currentLatitude: "52.3702",
      currentLongitude: "4.8952"
    };
    
    this.drivers.set(1, testDriver);
    this.currentDriverId = 2;

    // Create sample deliveries for testing
    const sampleDelivery1: Delivery = {
      id: 1,
      userId: 1,
      driverId: 1,
      orderNumber: "SP2025-001",
      type: "package",
      status: "delivered",
      pickupAddressId: null,
      pickupStreet: "Keizersgracht 123",
      pickupCity: "Amsterdam",
      pickupPostalCode: "1015 CJ",
      pickupLatitude: "52.3676",
      pickupLongitude: "4.9041",
      deliveryAddressId: null,
      deliveryStreet: "Vondelpark 45",
      deliveryCity: "Amsterdam",
      deliveryPostalCode: "1071 AA",
      deliveryLatitude: "52.3580",
      deliveryLongitude: "4.8690",
      estimatedPrice: "12.50",
      finalPrice: "12.50",
      estimatedDeliveryTime: 45,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      pickedUpAt: new Date(Date.now() - 90 * 60 * 1000), // 90 minutes ago
      deliveredAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    };

    const sampleDelivery2: Delivery = {
      id: 2,
      userId: 1,
      driverId: 1,
      orderNumber: "SP2025-002",
      type: "letter",
      status: "in_transit",
      pickupAddressId: null,
      pickupStreet: "Vondelpark 45",
      pickupCity: "Amsterdam",
      pickupPostalCode: "1071 AA",
      pickupLatitude: "52.3580",
      pickupLongitude: "4.8690",
      deliveryAddressId: null,
      deliveryStreet: "Damrak 1",
      deliveryCity: "Amsterdam",
      deliveryPostalCode: "1012 LG",
      deliveryLatitude: "52.3738",
      deliveryLongitude: "4.8909",
      estimatedPrice: "8.50",
      finalPrice: null,
      estimatedDeliveryTime: 30,
      createdAt: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      pickedUpAt: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago
      deliveredAt: null,
    };

    this.deliveries.set(1, sampleDelivery1);
    this.deliveries.set(2, sampleDelivery2);
    this.currentDeliveryId = 3;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Addresses
  async getAddress(id: number): Promise<Address | undefined> {
    return this.addresses.get(id);
  }

  async getAddressesByUserId(userId: number): Promise<Address[]> {
    return Array.from(this.addresses.values()).filter(address => address.userId === userId);
  }

  async createAddress(insertAddress: InsertAddress): Promise<Address> {
    const id = this.currentAddressId++;
    const address: Address = { ...insertAddress, id };
    this.addresses.set(id, address);
    return address;
  }

  // Drivers
  async getDriver(id: number): Promise<Driver | undefined> {
    return this.drivers.get(id);
  }

  async getAvailableDrivers(): Promise<Driver[]> {
    return Array.from(this.drivers.values()).filter(driver => driver.isActive);
  }

  async createDriver(insertDriver: InsertDriver): Promise<Driver> {
    const id = this.currentDriverId++;
    const driver: Driver = { ...insertDriver, id };
    this.drivers.set(id, driver);
    return driver;
  }

  async updateDriverLocation(id: number, latitude: string, longitude: string): Promise<Driver | undefined> {
    const driver = this.drivers.get(id);
    if (driver) {
      const updatedDriver = { ...driver, currentLatitude: latitude, currentLongitude: longitude };
      this.drivers.set(id, updatedDriver);
      return updatedDriver;
    }
    return undefined;
  }

  // Deliveries
  async getDelivery(id: number): Promise<Delivery | undefined> {
    return this.deliveries.get(id);
  }

  async getDeliveriesByUserId(userId: number): Promise<Delivery[]> {
    return Array.from(this.deliveries.values()).filter(delivery => delivery.userId === userId);
  }

  async getDeliveriesByDriverId(driverId: number): Promise<Delivery[]> {
    return Array.from(this.deliveries.values()).filter(delivery => delivery.driverId === driverId);
  }

  async createDelivery(insertDelivery: InsertDelivery): Promise<Delivery> {
    const id = this.currentDeliveryId++;
    const orderNumber = `SP${new Date().getFullYear()}-${String(id).padStart(3, '0')}`;
    
    const delivery: Delivery = { 
      ...insertDelivery, 
      id, 
      orderNumber,
      createdAt: new Date(),
      pickedUpAt: null,
      deliveredAt: null
    };
    
    this.deliveries.set(id, delivery);
    return delivery;
  }

  async updateDeliveryStatus(id: number, status: string, driverId?: number): Promise<Delivery | undefined> {
    const delivery = this.deliveries.get(id);
    if (delivery) {
      const updatedDelivery = { ...delivery, status };
      if (driverId) {
        updatedDelivery.driverId = driverId;
      }
      this.deliveries.set(id, updatedDelivery);
      return updatedDelivery;
    }
    return undefined;
  }

  async updateDeliveryPickupTime(id: number): Promise<Delivery | undefined> {
    const delivery = this.deliveries.get(id);
    if (delivery) {
      const updatedDelivery = { ...delivery, pickedUpAt: new Date() };
      this.deliveries.set(id, updatedDelivery);
      return updatedDelivery;
    }
    return undefined;
  }

  async updateDeliveryDeliveredTime(id: number): Promise<Delivery | undefined> {
    const delivery = this.deliveries.get(id);
    if (delivery) {
      const updatedDelivery = { ...delivery, deliveredAt: new Date() };
      this.deliveries.set(id, updatedDelivery);
      return updatedDelivery;
    }
    return undefined;
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAddress(id: number): Promise<Address | undefined> {
    const [address] = await db.select().from(addresses).where(eq(addresses.id, id));
    return address || undefined;
  }

  async getAddressesByUserId(userId: number): Promise<Address[]> {
    return await db.select().from(addresses).where(eq(addresses.userId, userId));
  }

  async createAddress(insertAddress: InsertAddress): Promise<Address> {
    const [address] = await db
      .insert(addresses)
      .values(insertAddress)
      .returning();
    return address;
  }

  async getDriver(id: number): Promise<Driver | undefined> {
    const [driver] = await db.select().from(drivers).where(eq(drivers.id, id));
    return driver || undefined;
  }

  async getAvailableDrivers(): Promise<Driver[]> {
    return await db.select().from(drivers).where(eq(drivers.isActive, true));
  }

  async createDriver(insertDriver: InsertDriver): Promise<Driver> {
    const [driver] = await db
      .insert(drivers)
      .values(insertDriver)
      .returning();
    return driver;
  }

  async updateDriverLocation(id: number, latitude: string, longitude: string): Promise<Driver | undefined> {
    const [driver] = await db
      .update(drivers)
      .set({ currentLatitude: latitude, currentLongitude: longitude })
      .where(eq(drivers.id, id))
      .returning();
    return driver || undefined;
  }

  async getDelivery(id: number): Promise<Delivery | undefined> {
    const [delivery] = await db.select().from(deliveries).where(eq(deliveries.id, id));
    return delivery || undefined;
  }

  async getDeliveriesByUserId(userId: number): Promise<Delivery[]> {
    return await db.select().from(deliveries).where(eq(deliveries.userId, userId));
  }

  async getDeliveriesByDriverId(driverId: number): Promise<Delivery[]> {
    return await db.select().from(deliveries).where(eq(deliveries.driverId, driverId));
  }

  async createDelivery(insertDelivery: InsertDelivery): Promise<Delivery> {
    const orderNumber = `SP${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    
    const [delivery] = await db
      .insert(deliveries)
      .values({
        ...insertDelivery,
        orderNumber,
        status: "pending"
      })
      .returning();
    return delivery;
  }

  async updateDeliveryStatus(id: number, status: string, driverId?: number): Promise<Delivery | undefined> {
    const updateData: any = { status };
    if (driverId) {
      updateData.driverId = driverId;
    }
    
    const [delivery] = await db
      .update(deliveries)
      .set(updateData)
      .where(eq(deliveries.id, id))
      .returning();
    return delivery || undefined;
  }

  async updateDeliveryPickupTime(id: number): Promise<Delivery | undefined> {
    const [delivery] = await db
      .update(deliveries)
      .set({ pickedUpAt: new Date() })
      .where(eq(deliveries.id, id))
      .returning();
    return delivery || undefined;
  }

  async updateDeliveryDeliveredTime(id: number): Promise<Delivery | undefined> {
    const [delivery] = await db
      .update(deliveries)
      .set({ deliveredAt: new Date() })
      .where(eq(deliveries.id, id))
      .returning();
    return delivery || undefined;
  }
}

export const storage = new DatabaseStorage();
