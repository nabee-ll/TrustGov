import { Request, Response } from 'express';
import { services, activityLog, stats } from '../db/mockDb';

export const getServices = (req: Request, res: Response) => {
  res.json({ success: true, services });
};

export const getActivity = (req: Request, res: Response) => {
  res.json({ success: true, activity: activityLog });
};

export const getStats = (req: Request, res: Response) => {
  res.json({ success: true, stats });
};

export const getHealth = (req: Request, res: Response) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development"
  });
};
