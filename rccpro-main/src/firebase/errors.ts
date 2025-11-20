
'use client';
import { getAuth, type User } from 'firebase/auth';

type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
  code?: string; // Added to support mapping to friendly messages
};

interface FirebaseAuthToken {
  name: string | null;
  email: string | null;
  email_verified: boolean;
  phone_number: string | null;
  sub: string;
  firebase: {
    identities: Record<string, string[]>;
    sign_in_provider: string;
    tenant: string | null;
  };
}

interface FirebaseAuthObject {
  uid: string;
  token: FirebaseAuthToken;
}

interface SecurityRuleRequest {
  auth: FirebaseAuthObject | null;
  method: string;
  path: string;
  resource?: {
    data: any;
  };
}

/**
 * Maps Firestore error codes to user-friendly messages.
 */
export function getFriendlyErrorMessage(code: string = 'unknown'): string {
  switch (code) {
    case 'permission-denied':
      return 'You do not have permission to view or edit this data.';
    case 'unavailable':
      return 'Network connection lost. Please check your internet connection.';
    case 'not-found':
      return 'The requested document was not found.';
    case 'already-exists':
      return 'The document already exists.';
    case 'resource-exhausted':
      return 'Quota exceeded. Please try again later.';
    case 'unauthenticated':
      return 'You must be signed in to perform this action.';
    default:
      return `An unexpected error occurred (${code}).`;
  }
}

/**
 * Builds a security-rule-compliant auth object from the Firebase User.
 */
function buildAuthObject(currentUser: User | null): FirebaseAuthObject | null {
  if (!currentUser) {
    return null;
  }

  const token: FirebaseAuthToken = {
    name: currentUser.displayName,
    email: currentUser.email,
    email_verified: currentUser.emailVerified,
    phone_number: currentUser.phoneNumber,
    sub: currentUser.uid,
    firebase: {
      identities: currentUser.providerData.reduce((acc, p) => {
        if (p.providerId) {
          acc[p.providerId] = [p.uid];
        }
        return acc;
      }, {} as Record<string, string[]>),
      sign_in_provider: currentUser.providerData[0]?.providerId || 'custom',
      tenant: currentUser.tenantId,
    },
  };

  return {
    uid: currentUser.uid,
    token: token,
  };
}

/**
 * Builds the complete, simulated request object for the error message.
 */
function buildRequestObject(context: SecurityRuleContext): SecurityRuleRequest {
  let authObject: FirebaseAuthObject | null = null;
  try {
    const firebaseAuth = getAuth();
    const currentUser = firebaseAuth.currentUser;
    if (currentUser) {
      authObject = buildAuthObject(currentUser);
    }
  } catch {
    // Firebase app might not be initialized
  }

  return {
    auth: authObject,
    method: context.operation,
    path: `/databases/(default)/documents/${context.path}`,
    resource: context.requestResourceData ? { data: context.requestResourceData } : undefined,
  };
}

/**
 * Builds the debug info string for LLM consumption.
 */
function buildDebugString(requestObject: SecurityRuleRequest): string {
  return `Missing or insufficient permissions: The following request was denied by Firestore Security Rules:
${JSON.stringify(requestObject, null, 2)}`;
}

/**
 * A custom error class designed to provide user-friendly messages to the UI
 * while retaining structured request data for AI debugging/logging.
 */
export class FirestorePermissionError extends Error {
  public readonly request: SecurityRuleRequest;
  public readonly code: string;
  public readonly debugInfo: string;
  public readonly userMessage: string;

  constructor(context: SecurityRuleContext) {
    const friendlyMessage = getFriendlyErrorMessage(context.code);
    super(friendlyMessage); // Set the main message to be user-friendly
    
    this.name = 'FirestorePermissionError';
    this.code = context.code || 'unknown';
    this.userMessage = friendlyMessage;
    
    // Build debug context
    const requestObject = buildRequestObject(context);
    this.request = requestObject;
    this.debugInfo = buildDebugString(requestObject);
  }
}
