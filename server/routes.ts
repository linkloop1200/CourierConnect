import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDeliverySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get user addresses
  app.get("/api/addresses/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const addresses = await storage.getAddressesByUserId(userId);
      res.json(addresses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch addresses" });
    }
  });

  // Get available drivers
  app.get("/api/drivers", async (req, res) => {
    try {
      const drivers = await storage.getAvailableDrivers();
      res.json(drivers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch drivers" });
    }
  });

  // Create new delivery
  app.post("/api/deliveries", async (req, res) => {
    try {
      const validatedData = insertDeliverySchema.parse(req.body);
      
      // Calculate estimated price based on type and distance
      let basePrice = 8.50;
      if (validatedData.type === "express") {
        basePrice = 15.75;
      } else if (validatedData.type === "package") {
        basePrice = 12.50;
      }
      
      // Add some random variation for demo purposes
      const estimatedPrice = (basePrice + Math.random() * 5).toFixed(2);
      
      const deliveryData = {
        ...validatedData,
        estimatedPrice,
        estimatedDeliveryTime: validatedData.type === "express" ? 30 : 45,
        status: "pending" as const
      };
      
      const delivery = await storage.createDelivery(deliveryData);
      
      // Auto-assign to available driver for demo
      const drivers = await storage.getAvailableDrivers();
      if (drivers.length > 0) {
        const assignedDriver = drivers[0];
        await storage.updateDeliveryStatus(delivery.id, "assigned", assignedDriver.id);
        
        // Simulate pickup after 5 seconds for demo
        setTimeout(async () => {
          await storage.updateDeliveryStatus(delivery.id, "picked_up");
          await storage.updateDeliveryPickupTime(delivery.id);
          
          // Simulate in transit after another 5 seconds
          setTimeout(async () => {
            await storage.updateDeliveryStatus(delivery.id, "in_transit");
          }, 5000);
        }, 5000);
      }
      
      res.json(delivery);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid delivery data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create delivery" });
      }
    }
  });

  // Get delivery by ID
  app.get("/api/deliveries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const delivery = await storage.getDelivery(id);
      
      if (!delivery) {
        return res.status(404).json({ error: "Delivery not found" });
      }
      
      // Include driver info if assigned
      let driverInfo = null;
      if (delivery.driverId) {
        driverInfo = await storage.getDriver(delivery.driverId);
      }
      
      res.json({ ...delivery, driver: driverInfo });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch delivery" });
    }
  });

  // Get user deliveries
  app.get("/api/deliveries/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const deliveries = await storage.getDeliveriesByUserId(userId);
      res.json(deliveries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user deliveries" });
    }
  });

  // Update delivery status
  app.patch("/api/deliveries/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      const delivery = await storage.updateDeliveryStatus(id, status);
      
      if (!delivery) {
        return res.status(404).json({ error: "Delivery not found" });
      }
      
      res.json(delivery);
    } catch (error) {
      res.status(500).json({ error: "Failed to update delivery status" });
    }
  });

  // Get price estimate
  app.post("/api/estimate", async (req, res) => {
    try {
      const { type, pickupLatitude, pickupLongitude, deliveryLatitude, deliveryLongitude } = req.body;
      
      // Simple price calculation based on type and distance
      let basePrice = 8.50;
      if (type === "express") {
        basePrice = 15.75;
      } else if (type === "package") {
        basePrice = 12.50;
      }
      
      // Add distance-based pricing if coordinates are provided
      if (pickupLatitude && pickupLongitude && deliveryLatitude && deliveryLongitude) {
        const distance = calculateDistance(
          parseFloat(pickupLatitude),
          parseFloat(pickupLongitude),
          parseFloat(deliveryLatitude),
          parseFloat(deliveryLongitude)
        );
        basePrice += distance * 0.5; // Add €0.50 per km
      }
      
      const estimatedPrice = (basePrice + Math.random() * 2).toFixed(2);
      const estimatedTime = type === "express" ? 30 : 45;
      
      res.json({
        estimatedPrice,
        estimatedTime,
        currency: "EUR"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to calculate estimate" });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
