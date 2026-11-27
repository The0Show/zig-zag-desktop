import { contextBridge } from "electron/renderer";
import ZigZagDesktop from "./ZigZagDesktop";

contextBridge.exposeInMainWorld("ZigZagDesktop", ZigZagDesktop);
