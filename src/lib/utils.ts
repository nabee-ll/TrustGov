import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface User {
  id: string;
  name: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface Activity {
  id: number;
  type: string;
  status: string;
  timestamp: string;
  location: string;
}
