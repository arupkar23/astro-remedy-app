import { Router } from "express";
import { db } from "../db";
import { users, consultations, orders, auditLogs } from "@shared/schema";
import { eq, like, or, desc, asc, sql } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcrypt";

const router = Router();

// SECURITY: JWT Secret is REQUIRED - fail startup if missing
if (!process.env.JWT_SECRET) {
  throw new Error("CRITICAL: JWT_SECRET environment variable is required for security");
}
const JWT_SECRET = process.env.JWT_SECRET;

// Import centralized authentication middleware (safer than redefining)
// These should be imported from main routes to prevent security drift
import jwt from 'jsonwebtoken';

const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Admin-only middleware
const requireAdmin = (req: any, res: any, next: any) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

// Enhanced Client Profile Schema for validation
const ClientProfileSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  dateOfBirth: z.string().optional(),
  timeOfBirth: z.string().optional(),
  placeOfBirth: z.object({
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    timezone: z.string().optional(),
  }).optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"), // Primary Phone (UID)
  countryCode: z.string().default("+91"),
  currentPhone: z.string().optional(),
  whatsappNumber: z.string().optional(),
  notes: z.string().optional(), // Personal notes from astrologer
});

// GET /api/clients - List all clients with search and filtering (ADMIN ONLY)
router.get("/", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { search, page = 1, limit = 20, sortBy = "createdAt", sortOrder = "desc" } = req.query;
    
    const offset = (Number(page) - 1) * Number(limit);
    
    let whereCondition = eq(users.isAdmin, false);
    
    // Search functionality
    if (search && typeof search === 'string') {
      whereCondition = sql`${users.isAdmin} = false AND (
        ${users.fullName} ILIKE ${`%${search}%`} OR
        ${users.email} ILIKE ${`%${search}%`} OR
        ${users.phoneNumber} ILIKE ${`%${search}%`} OR
        ${users.placeOfBirth} ILIKE ${`%${search}%`}
      )`;
    }

    const clients = await db.select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      phoneNumber: users.phoneNumber,
      countryCode: users.countryCode,
      whatsappNumber: users.whatsappNumber,
      dateOfBirth: users.dateOfBirth,
      timeOfBirth: users.timeOfBirth,
      placeOfBirth: users.placeOfBirth,
      notes: users.notes,
      isVerified: users.isVerified,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(whereCondition)
    .orderBy(sortOrder === 'asc' ? asc(users.createdAt) : desc(users.createdAt))
    .limit(Number(limit))
    .offset(offset);

    // Get total count for pagination
    const [{ count: total }] = await db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(whereCondition);

    res.json({
      clients,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).json({ error: "Failed to fetch clients" });
  }
});

// SECURITY FIX: Move stats route BEFORE /:id to prevent route conflict  
// GET /api/clients/stats/summary - Get client statistics for dashboard (ADMIN ONLY)
router.get("/stats/summary", authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Total clients
    const [{ count: totalClients }] = await db.select({ 
      count: sql<number>`count(*)` 
    }).from(users).where(eq(users.isAdmin, false));

    // New clients this month
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const [{ count: newThisMonth }] = await db.select({ 
      count: sql<number>`count(*)` 
    }).from(users).where(
      sql`${users.isAdmin} = false AND ${users.createdAt} >= ${firstDayOfMonth}`
    );

    // Total consultations
    const [{ count: totalConsultations }] = await db.select({ 
      count: sql<number>`count(*)` 
    }).from(consultations);

    // Total revenue from consultations and orders
    const consultationRevenue = await db.select({ 
      total: sql<number>`COALESCE(SUM(${consultations.price}), 0)` 
    }).from(consultations);
    
    const orderRevenue = await db.select({ 
      total: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)` 
    }).from(orders);

    const totalRevenue = (consultationRevenue[0]?.total || 0) + (orderRevenue[0]?.total || 0);

    res.json({
      totalClients: Number(totalClients),
      newThisMonth: Number(newThisMonth),
      totalConsultations: Number(totalConsultations),
      totalRevenue: Number(totalRevenue),
    });
  } catch (error) {
    console.error("Error fetching client statistics:", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

// GET /api/clients/:id - Get specific client with consultation and order history (ADMIN ONLY)
router.get("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Get client profile
    const [client] = await db.select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      phoneNumber: users.phoneNumber,
      countryCode: users.countryCode,
      whatsappNumber: users.whatsappNumber,
      dateOfBirth: users.dateOfBirth,
      timeOfBirth: users.timeOfBirth,
      placeOfBirth: users.placeOfBirth,
      notes: users.notes,
      isVerified: users.isVerified,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.id, id));

    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    // Get consultation history
    const consultationHistory = await db.select({
      id: consultations.id,
      type: consultations.type,
      scheduledAt: consultations.scheduledAt,
      duration: consultations.duration,
      actualDuration: consultations.actualDuration,
      status: consultations.status,
      price: consultations.price,
      paymentStatus: consultations.paymentStatus,
      notes: consultations.notes,
      createdAt: consultations.createdAt,
    })
    .from(consultations)
    .where(eq(consultations.clientId, id))
    .orderBy(desc(consultations.scheduledAt));

    // Get order history (using items from jsonb)
    const orderHistory = await db.select({
      id: orders.id,
      items: orders.items,
      totalAmount: orders.totalAmount,
      status: orders.status,
      trackingNumber: orders.trackingNumber,
      shippingAddress: orders.shippingAddress,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.customerId, id))
    .orderBy(desc(orders.createdAt));

    // Calculate totals
    const totalConsultationSpent = consultationHistory
      .filter(c => c.paymentStatus === 'paid')
      .reduce((sum, c) => sum + Number(c.price), 0);
    
    const totalOrderSpent = orderHistory
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + Number(o.totalAmount), 0);

    res.json({
      client: {
        ...client,
        placeOfBirth: client.placeOfBirth ? JSON.parse(client.placeOfBirth) : null,
      },
      consultationHistory: consultationHistory.map(c => ({
        ...c,
        amount: Number(c.price),
        date: c.scheduledAt,
      })),
      orderHistory: orderHistory.map(o => ({
        ...o,
        amount: Number(o.totalAmount),
        date: o.createdAt,
        productName: Array.isArray(o.items) && o.items.length > 0 ? o.items[0].name || 'Order' : 'Order',
      })),
      documents: [], // TODO: Implement document management
      summary: {
        totalConsultations: consultationHistory.length,
        totalOrders: orderHistory.length,
        totalSpent: totalConsultationSpent + totalOrderSpent,
        lastConsultation: consultationHistory[0]?.scheduledAt || null,
        lastOrder: orderHistory[0]?.createdAt || null,
      }
    });
  } catch (error) {
    console.error("Error fetching client:", error);
    res.status(500).json({ error: "Failed to fetch client" });
  }
});

// POST /api/clients - Create new client (ADMIN ONLY)
router.post("/", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const validatedData = ClientProfileSchema.parse(req.body);

    // Check if client with same phone number already exists
    const existingClient = await db.select()
      .from(users)
      .where(eq(users.phoneNumber, validatedData.phoneNumber))
      .limit(1);

    if (existingClient.length > 0) {
      return res.status(400).json({ 
        error: "Client with this phone number already exists" 
      });
    }

    // Generate secure random password and hash it
    const randomPassword = `${Math.random().toString(36).slice(-8)}${Math.random().toString(36).slice(-8)}`;
    const hashedPassword = await bcrypt.hash(randomPassword, 12);

    // Create new client - NEVER return password field
    const [newClient] = await db.insert(users).values({
      fullName: validatedData.fullName,
      email: validatedData.email,
      phoneNumber: validatedData.phoneNumber,
      countryCode: validatedData.countryCode,
      whatsappNumber: validatedData.whatsappNumber,
      dateOfBirth: validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : null,
      timeOfBirth: validatedData.timeOfBirth,
      placeOfBirth: validatedData.placeOfBirth ? JSON.stringify(validatedData.placeOfBirth) : null,
      notes: validatedData.notes,
      password: hashedPassword, // Securely hashed password
      username: `client_${Date.now()}`, // Auto-generated username
      isAdmin: false,
      isVerified: false,
    }).returning({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      phoneNumber: users.phoneNumber,
      countryCode: users.countryCode,
      whatsappNumber: users.whatsappNumber,
      dateOfBirth: users.dateOfBirth,
      timeOfBirth: users.timeOfBirth,
      placeOfBirth: users.placeOfBirth,
      notes: users.notes,
      username: users.username,
      isAdmin: users.isAdmin,
      isVerified: users.isVerified,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    });

    // Log the creation
    await db.insert(auditLogs).values({
      userId: newClient.id,
      action: "client_created",
      resourceType: "client",
      resourceId: newClient.id,
      details: {
        clientId: newClient.id,
        fullName: newClient.fullName,
        phoneNumber: newClient.phoneNumber,
      },
    });

    res.status(201).json({
      client: {
        ...newClient,
        placeOfBirth: newClient.placeOfBirth ? JSON.parse(newClient.placeOfBirth) : null,
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error creating client:", error);
    res.status(500).json({ error: "Failed to create client" });
  }
});

// PUT /api/clients/:id - Update client profile (ADMIN ONLY)
router.put("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = ClientProfileSchema.partial().parse(req.body);

    // Check if client exists
    const [existingClient] = await db.select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!existingClient) {
      return res.status(404).json({ error: "Client not found" });
    }

    // Check for phone number conflicts (if updating phone)
    if (validatedData.phoneNumber && validatedData.phoneNumber !== existingClient.phoneNumber) {
      const conflictClient = await db.select()
        .from(users)
        .where(eq(users.phoneNumber, validatedData.phoneNumber))
        .limit(1);

      if (conflictClient.length > 0) {
        return res.status(400).json({ 
          error: "Another client with this phone number already exists" 
        });
      }
    }

    // Prepare update data
    const updateData: any = {
      ...validatedData,
      updatedAt: new Date(),
    };

    if (validatedData.dateOfBirth) {
      updateData.dateOfBirth = new Date(validatedData.dateOfBirth);
    }

    if (validatedData.placeOfBirth) {
      updateData.placeOfBirth = JSON.stringify(validatedData.placeOfBirth);
    }

    // Update client
    const [updatedClient] = await db.update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        phoneNumber: users.phoneNumber,
        countryCode: users.countryCode,
        whatsappNumber: users.whatsappNumber,
        dateOfBirth: users.dateOfBirth,
        timeOfBirth: users.timeOfBirth,
        placeOfBirth: users.placeOfBirth,
        notes: users.notes,
        username: users.username,
        isAdmin: users.isAdmin,
        isVerified: users.isVerified,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      });

    // Log the update
    await db.insert(auditLogs).values({
      userId: id,
      action: "client_updated",
      resourceType: "client",
      resourceId: id,
      details: {
        clientId: id,
        changes: validatedData,
      },
    });

    res.json({
      client: {
        ...updatedClient,
        placeOfBirth: updatedClient.placeOfBirth ? JSON.parse(updatedClient.placeOfBirth) : null,
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error updating client:", error);
    res.status(500).json({ error: "Failed to update client" });
  }
});

// DELETE /api/clients/:id - Soft delete client (ADMIN ONLY)
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [deletedClient] = await db.update(users)
      .set({
        accountStatus: "suspended",
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    if (!deletedClient) {
      return res.status(404).json({ error: "Client not found" });
    }

    // Log the deletion
    await db.insert(auditLogs).values({
      userId: id,
      action: "client_suspended",
      resourceType: "client",
      resourceId: id,
      details: {
        clientId: id,
        reason: "Admin deletion",
      },
    });

    res.json({ message: "Client suspended successfully" });
  } catch (error) {
    console.error("Error deleting client:", error);
    res.status(500).json({ error: "Failed to delete client" });
  }
});


export default router;