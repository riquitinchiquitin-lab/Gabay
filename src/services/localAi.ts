/**
 * Service for interacting with Local AI (Chrome/Safari Prompt API)
 */

export interface LocalAiOptions {
  temperature?: number;
  topK?: number;
}

class LocalAiService {
  private session: any = null;

  async isAvailable(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    // Check for the standard Chrome/Safari Prompt API
    return !!(window as any).ai?.canCreateGenericSession && (await (window as any).ai.canCreateGenericSession()) !== 'no';
  }

  async getSession(options?: LocalAiOptions) {
    if (this.session) return this.session;
    
    if (await this.isAvailable()) {
      try {
        this.session = await (window as any).ai.createGenericSession(options);
        return this.session;
      } catch (e) {
        console.error("Failed to create Local AI session:", e);
        return null;
      }
    }
    return null;
  }

  async prompt(text: string, options?: LocalAiOptions): Promise<string> {
    const session = await this.getSession(options);
    if (!session) throw new Error("Local AI not available or session failed.");
    
    try {
      return await session.prompt(text);
    } catch (e) {
      console.error("Local AI prompt failed:", e);
      throw e;
    }
  }

  async promptStreaming(text: string, onChunk: (chunk: string) => void, options?: LocalAiOptions): Promise<void> {
    const session = await this.getSession(options);
    if (!session) throw new Error("Local AI not available or session failed.");
    
    try {
      const stream = session.promptStreaming(text);
      for await (const chunk of stream) {
        onChunk(chunk);
      }
    } catch (e) {
      console.error("Local AI streaming prompt failed:", e);
      throw e;
    }
  }

  destroy() {
    if (this.session) {
      this.session.destroy();
      this.session = null;
    }
  }
}

export const localAi = new LocalAiService();
