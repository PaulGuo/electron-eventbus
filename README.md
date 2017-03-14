# Electron-EventBus

```
EventBus.on
EventBus.emit
EventBus.broadcast
```

## 使用示例

```
const XtremeEventBus = new EventBus();

XtremeEventBus.on('componentManagment:componentSelected', () => {
    console.log('componentSelected occurred!');
});

XtremeEventBus.emit('event');
XtremeEventBus.broadcast('event');
```
