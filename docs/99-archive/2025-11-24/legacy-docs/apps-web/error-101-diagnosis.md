# Error Code -101 Diagnosis
---

## Overview

This document error code -101 diagnosis.

---


> **Date:** 2025-11-24  
> **Error:** Error Code: -101  
> **URL:** http://localhost:3000/  
> **Status:** 🔍 **DIAGNOSING**

---

## 🐛 **Error Description**

**Error Code: -101**
- Typically indicates a **network connection error**
- Common causes:
  - Server not running
  - Port not listening
  - Connection refused
  - DNS resolution failure
  - Firewall blocking connection

---

## 🔍 **Diagnostic Steps**

### **1. Check Server Status**

**Command:**
```bash
netstat -ano | findstr ":3000"
```

**Expected:** Should show `LISTENING` status

### **2. Check Node Processes**

**Command:**
```bash
Get-Process -Name "node"
```

**Expected:** Should show dev server process

### **3. Test Port Connection**

**Command:**
```bash
Test-NetConnection -ComputerName localhost -Port 3000
```

**Expected:** Should show `TcpTestSucceeded: True`

---

## 🔧 **Possible Causes & Fixes**

### **Cause 1: Server Not Running**

**Symptoms:**
- No process listening on port 3000
- No Node.js processes found

**Fix:**
```bash
# Start dev server
pnpm dev
```

### **Cause 2: Server Still Compiling**

**Symptoms:**
- Node.js process exists
- Port not yet listening
- Terminal shows compilation in progress

**Fix:**
- Wait for compilation to complete
- Look for "Ready" message in terminal

### **Cause 3: Port Conflict**

**Symptoms:**
- Port 3000 in use by different process
- Connection refused

**Fix:**
```bash
# Kill all Node processes
Get-Process -Name "node" | Stop-Process -Force

# Restart server
pnpm dev
```

### **Cause 4: Firewall/Antivirus Blocking**

**Symptoms:**
- Server running but connection fails
- Port shows LISTENING but connection refused

**Fix:**
- Check Windows Firewall
- Check antivirus settings
- Allow Node.js through firewall

### **Cause 5: Webpack Config Issue**

**Symptoms:**
- Server starts but crashes
- Compilation errors

**Fix:**
- Check `next.config.ts` for errors
- Verify webpack configuration
- Check terminal for error messages

---

## ✅ **Immediate Actions**

1. **Check if server is running:**
   ```bash
   netstat -ano | findstr ":3000"
   ```

2. **If not running, start server:**
   ```bash
   pnpm dev
   ```

3. **Wait for compilation:**
   - Look for "Ready" message
   - Check for any errors

4. **Test connection:**
   - Try accessing `http://localhost:3000` again
   - Check browser console for errors

---

## 📋 **Checklist**

- [ ] Server process is running
- [ ] Port 3000 is listening
- [ ] Compilation completed successfully
- [ ] No errors in terminal
- [ ] Firewall not blocking
- [ ] Browser can connect to localhost

---

## ✅ **Fix Applied**

### **Server Restart**

**Issue:** Port 3000 was not listening (server not running)

**Actions Taken:**
1. ✅ Killed all Node.js processes
2. ✅ Cleaned `.next` directory
3. ✅ Restarted dev server from `apps/web` directory
4. ⏳ Waiting for compilation to complete

**Next Steps:**
- Wait for "Ready" message in terminal
- Check for compilation errors
- Try accessing `http://localhost:3000` again

---

**Last Updated:** 2025-11-24  
**Status:** ✅ **SERVER RESTARTED** - Waiting for compilation

