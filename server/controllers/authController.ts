import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { users } from '../db/mockDb';

const JWT_SECRET = process.env.JWT_SECRET || "gov-secure-secret-key-123";

export const login = (req: Request, res: Response) => {
  const { citizenId, password } = req.body;
  const user = users.find(u => u.id === citizenId && u.password === password);

  if (user) {
    // In a real app, we'd send an OTP here. For simulation, we just return success.
    res.json({ success: true, message: "OTP sent to registered mobile number" });
  } else {
    res.status(401).json({ success: false, message: "Invalid Citizen ID or Password" });
  }
};

export const verify = (req: Request, res: Response) => {
  const { citizenId, otp } = req.body;
  
  // Simulate OTP verification (any 6 digit code works for demo)
  if (otp === "123456") {
    const token = jwt.sign({ citizenId }, JWT_SECRET, { expiresIn: "1h" });
    
    // Set cookie with secure options for AI Studio iframe environment
    res.cookie("auth_token", token, { 
      httpOnly: true, 
      secure: true, 
      sameSite: "none",
      maxAge: 3600000 // 1 hour
    });
    
    res.json({ 
      success: true, 
      token, 
      user: { id: citizenId, name: "John Citizen" } 
    });
  } else {
    res.status(401).json({ success: false, message: "Invalid OTP" });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: true,
    sameSite: "none"
  });
  res.json({ success: true, message: "Logged out successfully" });
};
