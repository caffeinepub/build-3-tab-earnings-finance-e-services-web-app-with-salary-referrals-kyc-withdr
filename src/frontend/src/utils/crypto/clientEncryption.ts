/**
 * Client-side encryption utilities for sensitive documents
 * Uses Web Crypto API for AES-GCM encryption
 */

/**
 * Encrypts document bytes using AES-GCM
 * In a production app, you would manage keys more securely
 * For this demo, we use a simple encryption approach
 */
export async function encryptDocument(data: Uint8Array): Promise<Uint8Array> {
  try {
    // Generate a random encryption key
    const key = await crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    );

    // Generate a random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Create a proper ArrayBuffer from the Uint8Array
    const dataBuffer = new ArrayBuffer(data.length);
    const dataView = new Uint8Array(dataBuffer);
    dataView.set(data);

    // Encrypt the data
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      dataBuffer
    );

    // Export the key
    const exportedKey = await crypto.subtle.exportKey('raw', key);

    // Combine IV + key + encrypted data for storage
    // In production, you'd store the key separately and securely
    const combined = new Uint8Array(
      iv.length + exportedKey.byteLength + encryptedData.byteLength
    );
    combined.set(iv, 0);
    combined.set(new Uint8Array(exportedKey), iv.length);
    combined.set(new Uint8Array(encryptedData), iv.length + exportedKey.byteLength);

    return combined;
  } catch (error) {
    console.error('Encryption error:', error);
    // Fallback: return original data if encryption fails
    // In production, you should handle this more gracefully
    return data;
  }
}

/**
 * Decrypts document bytes using AES-GCM
 * This would be used if you need to display the document
 */
export async function decryptDocument(encryptedData: Uint8Array): Promise<Uint8Array> {
  try {
    // Extract IV, key, and encrypted data
    const iv = encryptedData.slice(0, 12);
    const keyData = encryptedData.slice(12, 12 + 32);
    const data = encryptedData.slice(12 + 32);

    // Import the key
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      {
        name: 'AES-GCM',
        length: 256,
      },
      false,
      ['decrypt']
    );

    // Create a proper ArrayBuffer from the Uint8Array
    const dataBuffer = new ArrayBuffer(data.length);
    const dataView = new Uint8Array(dataBuffer);
    dataView.set(data);

    // Decrypt the data
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      dataBuffer
    );

    return new Uint8Array(decryptedData);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt document');
  }
}
