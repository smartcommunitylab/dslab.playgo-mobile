import { Injectable } from '@angular/core';

export interface JwtPayload {
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class JwtHelperService {
  
  /**
   * Decodifica un JWT senza validarlo (client-side)
   */
  decodeToken(token: string): JwtPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('Invalid JWT format');
        return null;
      }

      const payload = parts[1];
      const decoded = this.base64UrlDecode(payload);
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }

  /**
   * Estrae un claim dal token
   */
  getClaim(token: string, claimName: string): string | null {
    const payload = this.decodeToken(token);
    if (!payload) return null;
    return payload[claimName] || null;
  }

  /**
   * Verifica se il claim soddisfa una regex
   */
  validateClaimWithRegex(claimValue: string | null, regex: string): boolean {
    if (!claimValue) return false;
    
    try {
      const pattern = new RegExp(regex);
      return pattern.test(claimValue);
    } catch (error) {
      console.error('Invalid regex:', regex, error);
      return false;
    }
  }

  /**
   * Estrae i valori multipli da un claim (separati da virgola)
   */
  parseMultiValueClaim(claimValue: string): string[] {
    if (!claimValue) return [];
    
    return claimValue
      .split(',')
      .map(v => v.trim())
      .filter(v => v.length > 0);
  }

  private base64UrlDecode(str: string): string {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    if (pad) {
      if (pad === 1) throw new Error('Invalid base64url string');
      base64 += new Array(5 - pad).join('=');
    }
    return decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  }
}