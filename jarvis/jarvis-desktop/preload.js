import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  getConfig: async () => {
    return await ipcRenderer.invoke('get-config')
  },
  minimize: () => ipcRenderer.send('minimize-window'),
  maximize: () => ipcRenderer.send('maximize-window'),
  close: () => ipcRenderer.send('close-window'),
  onWindowStateChanged: (callback) => {
    ipcRenderer.on('window-state', (event, state) => callback(state))
  },
})
