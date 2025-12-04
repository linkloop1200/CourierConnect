import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDeliverySchema } from "@shared/schema";
import { z } from "zod";

// Simple in-memory stores for demo-only endpoints
const feedbackStore: Array<{
  id: string;
  helpful: number;
  notHelpful: number;
}> = [];

const preferenceStore: Record<string, any> = {};

export async function registerRoutes(app: Express): Promise<Server> {
  // Config endpoint for frontend to read public keys
  app.get("/api/config", (_req, res) => {
    res.json({
      GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || null,
      LOCATIONIQ_API_KEY: process.env.LOCATIONIQ_API_KEY || null,
    });
  });

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
  app.get("/api/drivers", async (_req, res) => {
    try {
      const drivers = await storage.getAvailableDrivers();
      res.json(drivers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch drivers" });
    }
  });

  // Get driver by id
  app.get("/api/drivers/:id", async (req, res) => {
    try {
      const driverId = parseInt(req.params.id);
      const driver = await storage.getDriver(driverId);
      if (!driver) {
        return res.status(404).json({ error: "Driver not found" });
      }
      res.json(driver);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch driver" });
    }
  });

  // Driver location updates (simple demo)
  app.post("/api/drivers/location", async (req, res) => {
    try {
      const driverId = typeof req.body?.driverId === "number" ? req.body.driverId : 1;
      const { lat, lng, latitude, longitude } = req.body;
      const latValue = lat ?? latitude;
      const lngValue = lng ?? longitude;

      if (latValue === undefined || lngValue === undefined) {
        return res.status(400).json({ error: "Latitude and longitude are required" });
      }

      const driver = await storage.updateDriverLocation(
        driverId,
        String(latValue),
        String(lngValue),
      );

      if (!driver) {
        return res.status(404).json({ error: "Driver not found" });
      }

      res.json(driver);
    } catch (error) {
      res.status(500).json({ error: "Failed to update driver location" });
    }
  });

  app.put("/api/drivers/:driverId/location", async (req, res) => {
    try {
      const driverId = parseInt(req.params.driverId);
      const { latitude, longitude } = req.body;

      if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({ error: "Latitude and longitude are required" });
      }

      const driver = await storage.updateDriverLocation(
        driverId,
        String(latitude),
        String(longitude),
      );

      if (!driver) {
        return res.status(404).json({ error: "Driver not found" });
      }

      res.json(driver);
    } catch (error) {
      res.status(500).json({ error: "Failed to update driver location" });
    }
  });

  // Driver deliveries
  app.get("/api/drivers/:driverId/deliveries", async (req, res) => {
    try {
      const driverId = parseInt(req.params.driverId);
      const deliveries = await storage.getDeliveriesByDriverId(driverId);
      res.json(deliveries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch driver deliveries" });
    }
  });

  // Create new delivery
  app.post("/api/deliveries", async (req, res) => {
    try {
      const validatedData = insertDeliverySchema.parse(req.body);

      // Calculate estimated price based on type and distance
      let basePrice = 8.5;
      if (validatedData.type === "express") {
        basePrice = 15.75;
      } else if (validatedData.type === "package") {
        basePrice = 12.5;
      }

      // Add some random variation for demo purposes
      const estimatedPrice = (basePrice + Math.random() * 5).toFixed(2);

      const deliveryData = {
        ...validatedData,
        estimatedPrice,
        estimatedDeliveryTime: validatedData.type === "express" ? 30 : 45,
        status: "pending" as const,
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

  // Accept a delivery (driver assignment)
  app.post("/api/deliveries/:id/accept", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const driverId = typeof req.body?.driverId === "number" ? req.body.driverId : 1;
      const delivery = await storage.updateDeliveryStatus(id, "assigned", driverId);

      if (!delivery) {
        return res.status(404).json({ error: "Delivery not found" });
      }

      res.json(delivery);
    } catch (error) {
      res.status(500).json({ error: "Failed to accept delivery" });
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

  // All deliveries (used by several dashboard widgets)
  app.get("/api/deliveries", async (_req, res) => {
    try {
      const allDeliveries = await storage.getAllDeliveries();
      res.json(allDeliveries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch deliveries" });
    }
  });

  // Support POST for status updates (matches some client calls)
  app.post("/api/deliveries/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, driverId } = req.body;
      const delivery = await storage.updateDeliveryStatus(id, status, driverId);

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
      let basePrice = 8.5;
      if (type === "express") {
        basePrice = 15.75;
      } else if (type === "package") {
        basePrice = 12.5;
      }

      // Add distance-based pricing if coordinates are provided
      if (pickupLatitude && pickupLongitude && deliveryLatitude && deliveryLongitude) {
        const distance = calculateDistance(
          parseFloat(pickupLatitude),
          parseFloat(pickupLongitude),
          parseFloat(deliveryLatitude),
          parseFloat(deliveryLongitude),
        );
        basePrice += distance * 0.5; // Add €0.50 per km
      }

      const estimatedPrice = (basePrice + Math.random() * 2).toFixed(2);
      const estimatedTime = type === "express" ? 30 : 45;

      res.json({
        estimatedPrice,
        estimatedTime,
        currency: "EUR",
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to calculate estimate" });
    }
  });

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // LocationIQ API key endpoint
  app.get("/api/locationiq-key", (_req, res) => {
    res.json({ key: process.env.LOCATIONIQ_API_KEY || "" });
  });

  // Feedback endpoints (demo only)
  app.get("/api/feedback", (_req, res) => {
    res.json(feedbackStore);
  });

  app.post("/api/feedback", (req, res) => {
    const id = `fb-${feedbackStore.length + 1}`;
    const feedback = {
      id,
      helpful: 0,
      notHelpful: 0,
      ...req.body,
    };
    feedbackStore.push(feedback);
    res.status(201).json(feedback);
  });

  app.post("/api/feedback/:id/vote", (req, res) => {
    const item = feedbackStore.find((f) => f.id === req.params.id);
    if (!item) {
      return res.status(404).json({ error: "Feedback not found" });
    }
    if (req.body?.vote === "helpful") item.helpful += 1;
    if (req.body?.vote === "not_helpful") item.notHelpful += 1;
    res.json(item);
  });

  // Preferences endpoints (demo only)
  app.get("/api/preferences", (_req, res) => {
    res.json(Object.values(preferenceStore));
  });

  app.put("/api/preferences/:id", (req, res) => {
    const id = req.params.id;
    preferenceStore[id] = { ...req.body, id };
    res.json(preferenceStore[id]);
  });

  // Payment placeholder
  app.post("/api/deliveries/:id/payment", (req, res) => {
    const id = parseInt(req.params.id);
    res.json({ deliveryId: id, status: "paid", provider: req.body?.provider || "stripe" });
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
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
