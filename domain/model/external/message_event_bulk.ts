interface IMessageResult {
  messageId: string;
  foreignId: string;
  result: {
    kind: string;
    action?: number;
    // TODO: Add more keys
  };
  ts: number;
}

export interface MessageEventBulk {
  messages: IMessageResult[];
}
