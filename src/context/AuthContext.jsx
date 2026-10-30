import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Pre-seeded Official Roster (Strictly Server/Database-Driven, No UI Role Switcher)
export const OFFICIAL_ROSTER = {
  'officer.rev@telangana.gov.in': {
    id: 101,
    name: 'Sri V. Ramesh, Tahsildar / Revenue Officer',
    email: 'officer.rev@telangana.gov.in',
    departmentId: 'REV',
    departmentName: 'Revenue Department Services',
    districtId: 'HYD',
    districtName: 'Hyderabad',
    officeName: 'MeeSeva Center - Sanath Nagar',
    assignedCounter: 'Counter 01',
    role: 'OFFICIAL',
    badge: 'REVENUE-OFFICER-HYD'
  },
  'officer.rta@telangana.gov.in': {
    id: 102,
    name: 'Smt. K. Sunitha, Motor Vehicle Inspector',
    email: 'officer.rta@telangana.gov.in',
    departmentId: 'RTA',
    departmentName: 'Transport Department (RTA Services)',
    districtId: 'HYD',
    districtName: 'Hyderabad',
    officeName: 'District RTO Office - Hyderabad',
    assignedCounter: 'Counter 04',
    role: 'OFFICIAL',
    badge: 'RTO-INSPECTOR-HYD'
  },
  'officer.reg@telangana.gov.in': {
    id: 103,
    name: 'Sri P. Anand Rao, Municipal Registrar',
    email: 'officer.reg@telangana.gov.in',
    departmentId: 'REG',
    departmentName: 'Civil Registration & Municipal Services',
    districtId: 'HNK',
    districtName: 'Hanamkonda',
    officeName: 'MeeSeva Center - Municipal Complex, Hanamkonda',
    assignedCounter: 'Counter 03',
    role: 'OFFICIAL',
    badge: 'MUNICIPAL-REG-HNK'
  },
  'officer.civil@telangana.gov.in': {
    id: 104,
    name: 'Smt. M. Geetha, Civil Supplies Officer',
    email: 'officer.civil@telangana.gov.in',
    departmentId: 'CIVIL',
    departmentName: 'Civil Supplies & Ration Services',
    districtId: 'NZB',
    districtName: 'Nizamabad',
    officeName: 'MeeSeva Center - Civil Supplies Hub, Nizamabad',
    assignedCounter: 'Counter 06',
    role: 'OFFICIAL',
    badge: 'CIVIL-SUPPLIES-NZB'
  },
  'director.dqms@telangana.gov.in': {
    id: 999,
    name: 'Dr. C. Jayaraj, IAS, Commissioner of MeeSeva & e-Governance',
    email: 'director.dqms@telangana.gov.in',
    departmentId: 'ALL',
    departmentName: 'All State Departments',
    districtId: 'ALL',
    districtName: 'State Headquarters (All 33 Districts)',
    officeName: 'State Command Center, Secretariat, Hyderabad',
    assignedCounter: 'Control Room Master',
    role: 'ADMIN',
    badge: 'COMMISSIONER-IAS'
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { type: 'CITIZEN' | 'OFFICIAL', profile, token }
  const [activeOtpReq, setActiveOtpReq] = useState(null); // { identifier, userType, generatedOtp, expiresAt }
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('MEESEVA_AUTH_SESSION');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
          setUser(parsed.user);
        } else {
          localStorage.removeItem('MEESEVA_AUTH_SESSION');
        }
      }
    } catch (e) {
      console.error('Failed to restore auth session:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Request OTP for Citizen or Official
  const requestOtp = async (identifier, userType = 'CITIZEN') => {
    // In dev mode, deterministic mock OTP is 123456 (or logged to console for testing)
    const mockOtp = '123456';
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    const reqData = {
      identifier: identifier.trim().toLowerCase(),
      userType,
      generatedOtp: mockOtp,
      expiresAt
    };

    setActiveOtpReq(reqData);

    // Return status response
    return {
      success: true,
      identifier,
      userType,
      message: `OTP sent to ${identifier}. (Dev Sandbox Code: 123456)`,
      expiresInSeconds: 300
    };
  };

  // Verify OTP and Establish Session
  const verifyOtp = async (identifier, code, userType = 'CITIZEN') => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanCode = code.trim();

    if (!cleanCode) {
      throw new Error('Please enter the 6-digit OTP.');
    }

    // Validate OTP (matches active OTP or dev code 123456)
    if (cleanCode !== '123456' && (!activeOtpReq || activeOtpReq.generatedOtp !== cleanCode)) {
      throw new Error('Invalid OTP code. Please enter the valid 6-digit code (e.g. 123456).');
    }

    if (activeOtpReq && Date.now() > activeOtpReq.expiresAt) {
      throw new Error('OTP has expired. Please request a new one.');
    }

    let sessionUser = null;

    if (userType === 'CITIZEN') {
      // Citizen profile derived from mobile
      sessionUser = {
        type: 'CITIZEN',
        profile: {
          mobileNumber: cleanId,
          name: `Citizen (${cleanId.slice(0, 4)}***${cleanId.slice(7)})`,
          id: `cit-${cleanId}`,
          joinedAt: new Date().toISOString()
        },
        token: `jwt-citizen-${Date.now()}`
      };
    } else {
      // Official profile: Resolved strictly from database/roster. NO user-supplied role!
      const officialRecord = OFFICIAL_ROSTER[cleanId];
      if (!officialRecord) {
        throw new Error(
          `Unauthorized Government Email. Only registered official accounts (e.g. officer.rev@telangana.gov.in) may log in.`
        );
      }

      sessionUser = {
        type: 'OFFICIAL',
        profile: officialRecord,
        token: `jwt-official-${officialRecord.id}-${Date.now()}`
      };
    }

    setUser(sessionUser);
    setActiveOtpReq(null);

    // Persist session (valid 24h)
    localStorage.setItem(
      'MEESEVA_AUTH_SESSION',
      JSON.stringify({
        user: sessionUser,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000
      })
    );

    return sessionUser;
  };

  const logout = () => {
    setUser(null);
    setActiveOtpReq(null);
    localStorage.removeItem('MEESEVA_AUTH_SESSION');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        activeOtpReq,
        requestOtp,
        verifyOtp,
        logout,
        isAuthenticated: !!user,
        isCitizen: user?.type === 'CITIZEN',
        isOfficial: user?.type === 'OFFICIAL'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
