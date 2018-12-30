import * as EventEmitter from 'events'

const instances = {};

export default class MessageBus<T> {
    private _eventEmitter : EventEmitter;

    private constructor(){
        this._eventEmitter = new EventEmitter();
    }

    subscribe(callback: ((T) => void) ): void{
        this._eventEmitter.on('message', (item: T) => {
            setImmediate(() => {
                callback(item);
            });
        });
    }

    publish(item: T): void {
        this._eventEmitter.emit('message', item);
    }

    static instance<TItem>(TCtor: new (...args: any[]) => TItem): MessageBus<TItem> {
        const type = typeof(TCtor);
        if(!instances[type]){
            instances[type] = new MessageBus<TItem>();
        }

        return instances[type];
    }
}
  