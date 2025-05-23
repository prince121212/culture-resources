import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { login as loginService, register as registerService, AuthResponse, User, ApiError } from '@/services/auth.service';

interface AuthContextType {
  user: User | null;
// ... existing code ...
} 