// lib/bigint-json.ts
/**
 * Global BigInt JSON serialization handler
 * This allows BigInt values to be serialized to JSON as strings
 * 
 * Usage: Import this file ONCE at the top of your app (e.g., in layout.tsx or middleware)
 */

// Extend BigInt prototype to support JSON serialization
(BigInt.prototype as any).toJSON = function () {
    return this.toString();
  };
  
  // Optional: Add a custom JSON replacer for more control
  export function bigIntReplacer(key: string, value: any): any {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  }
  
  // Optional: Add a custom JSON reviver to parse BigInt strings back
  export function bigIntReviver(key: string, value: any): any {
    // List of known BigInt fields in your schema
    const bigIntFields = ['storageUsed', 'storageCapacity', 'memoryUsed', 'memoryTotal'];
    
    if (bigIntFields.includes(key) && typeof value === 'string' && /^\d+$/.test(value)) {
      return BigInt(value);
    }
    return value;
  }
  
  // Export a safe stringify function
  export function safeStringify(obj: any): string {
    return JSON.stringify(obj, bigIntReplacer);
  }
  
  // Export a safe parse function
  export function safeParse(json: string): any {
    return JSON.parse(json, bigIntReviver);
  }
  
  console.log('✅ BigInt JSON serialization enabled globally');
  
  export default {
    bigIntReplacer,
    bigIntReviver,
    safeStringify,
    safeParse,
  };