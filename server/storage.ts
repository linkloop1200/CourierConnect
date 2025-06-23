import { users, addresses, drivers, deliveries, type User, type InsertUser, type Address, type InsertAddress, type Driver, type InsertDriver, type Delivery, type InsertDelivery } from "@shared/schema";

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

export const storage = new MemStorage();
