const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthToken = () => {
  return localStorage.getItem('token') || '';
};

export interface StreamQueryOptions {
  message: string;
  history?: any[];
  onChunk?: (chunk: string) => void;
  onError?: (error: string) => void;
  onComplete?: () => void;
}

export const aiService = {
  /**
   * Stream Copilot response using Server-Sent Events (SSE)
   */
  async streamQuery({ message, history = [], onChunk, onError, onComplete }: StreamQueryOptions) {
    const token = getAuthToken();

    try {
      const response = await fetch(`${API_BASE_URL}/ai/assistant/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query: message, history })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.replace('data: ', ''));
              if (data.error) {
                onError?.(data.error);
                return;
              }
              if (data.chunk) {
                onChunk?.(data.chunk);
              }
              if (data.done) {
                onComplete?.();
                return;
              }
            } catch (parseErr) {
              console.warn('SSE Parse error:', parseErr);
            }
          }
        }
      }

      onComplete?.();
    } catch (err: any) {
      console.error('aiService streamQuery error:', err);
      onError?.(err.message || 'Failed to stream response from AI Copilot');
    }
  },

  /**
   * Fallback non-streaming query
   */
  async sendQuery({ message, history = [] }: { message: string; history?: any[] }) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/ai/assistant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ query: message, history })
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to send query to AI Copilot');
    }
    return data.response;
  },

  /**
   * Clear user conversation history
   */
  async clearHistory() {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/ai/assistant/clear`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    return data;
  }
};
