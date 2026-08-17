export class EventError<T = unknown> extends Error {

  event?: T;

  constructor(msg: string, event?: T) {
    super(msg);
    this.name = 'EventError'
    this.event = event;
  }
}