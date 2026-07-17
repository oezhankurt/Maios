import { contextBridge, ipcMain } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  getConfig: async () => {
    return await ipcMain.invoke('get-config')
  },
})
