type Listener = (data: any) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Listener[]> = new Map();

  connect() {
    // URL к твоему Go WebSocket хендлеру
    this.ws = new WebSocket('ws://localhost:8080/ws');

    this.ws.onopen = () => {
      console.log('WS Connected');
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // В твоем Go коде сообщения приходят с ключом "id" (uuid или object_id)
        // Мы используем этот ID как канал для подписки
        if (data.id) {
            this.notify(String(data.id), data);
        }
        // Если пришло уведомление для объекта (AI prediction)
        if (data.object) {
            this.notify(String(data.object), data);
        }
      } catch (e) {
        console.error('WS Parse error', e);
      }
    };
    
    this.ws.onclose = () => console.log('WS Closed');
  }

  // Подписка на конкретный ID (UUID импорта или ID объекта для AI)
  subscribe(id: string, callback: Listener) {
    if (!this.listeners.has(id)) {
      this.listeners.set(id, []);
    }
    this.listeners.get(id)?.push(callback);
  }

  unsubscribe(id: string, callback: Listener) {
    const list = this.listeners.get(id);
    if (list) {
      this.listeners.set(id, list.filter(cb => cb !== callback));
    }
  }

  private notify(id: string, data: any) {
    this.listeners.get(id)?.forEach(cb => cb(data));
  }
}

export const wsService = new WebSocketService();