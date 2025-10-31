# ✅ Server Optimization Checklist

Quick reference for maintaining optimal server performance.

---

## 🎯 Daily Checks

### **Memory Monitoring**

- [ ] Memory usage < 200MB per process
- [ ] No sudden memory spikes
- [ ] Memory stable over time (not growing)

### **Performance**

- [ ] Response time < 200ms average
- [ ] No 429 (rate limit) errors for legitimate users
- [ ] Socket connections < 500 per process

---

## 🔧 When Adding New Features

### **New API Endpoint**

- [ ] Added to appropriate router
- [ ] Rate limiting configured
- [ ] Input validation implemented
- [ ] Error handling added
- [ ] Response compressed (automatic with middleware)
- [ ] Body size limit respected

### **New Socket Event**

- [ ] Input validation added
- [ ] Message size limits checked
- [ ] Cleanup on disconnect handled
- [ ] Error handling implemented
- [ ] Tested with disconnections

### **New Database Query**

- [ ] Using connection pool (automatic with mongoose)
- [ ] Query has timeout
- [ ] Error handling added
- [ ] Indexed fields used in query

---

## 🚨 Red Flags (Fix Immediately!)

### **Critical Issues**

- ❌ Memory > 500MB
- ❌ CPU > 80% sustained
- ❌ Response time > 2 seconds
- ❌ Socket connections growing without users
- ❌ MongoDB connections > 50

### **Warning Signs**

- ⚠️ Memory growing over time (memory leak)
- ⚠️ Many rate limit hits (need higher limit or caching)
- ⚠️ Frequent socket disconnects (network issues)
- ⚠️ Slow database queries (need indexes)

---

## 📊 Performance Budgets

### **Memory Limits**

| Process         | Target  | Warning | Critical |
| --------------- | ------- | ------- | -------- |
| Single instance | < 150MB | > 200MB | > 300MB  |
| With clustering | < 120MB | > 150MB | > 200MB  |

### **Response Times**

| Endpoint Type  | Target  | Warning |
| -------------- | ------- | ------- |
| Simple GET     | < 50ms  | > 100ms |
| Complex GET    | < 100ms | > 200ms |
| POST/PUT       | < 150ms | > 300ms |
| Socket message | < 20ms  | > 50ms  |

### **Connection Limits**

| Type                | Limit  | Current |
| ------------------- | ------ | ------- |
| HTTP requests/min   | < 1000 | \_\_\_  |
| Socket connections  | < 500  | \_\_\_  |
| MongoDB connections | 10     | \_\_\_  |

---

## 🧪 Testing Before Deploy

### **Load Testing**

```bash
# Test with Apache Bench
ab -n 1000 -c 10 http://localhost:5000/api/rooms/

# Should complete without errors
# Response time should be < 200ms average
```

### **Memory Leak Check**

```bash
# Run server for 10 minutes
npm run dev

# Check memory every minute
# Should be stable (not growing continuously)
```

### **Rate Limit Test**

```bash
# Make 101 requests rapidly
for i in {1..101}; do
    curl http://localhost:5000/api/test
done

# Request 101 should get 429 error
```

---

## 🔍 Monitoring Commands

### **Check Memory**

```bash
# Windows Task Manager
Ctrl + Shift + Esc → Details → Find node.exe

# PowerShell
Get-Process node | Select-Object PM

# Inside Node.js
process.memoryUsage()
```

### **Check Connected Users**

```bash
# Visit health endpoint
curl http://localhost:5000/health

# Or add to server:
console.log('Connected users:', connectedUsers.size);
```

### **Check Database Connections**

```javascript
// Add to server.js
mongoose.connection.on("connected", () => {
  console.log("Active connections:", mongoose.connection.readyState);
});
```

---

## 🛠️ Quick Fixes

### **High Memory Usage**

```bash
# 1. Restart server
pm2 restart all

# 2. Clear Node.js cache
npm cache clean --force

# 3. Check for memory leaks
node --inspect src/server.js
# Open chrome://inspect
```

### **Slow Responses**

```javascript
// Add logging to find slow routes
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (duration > 200) {
      console.warn(`Slow request: ${req.method} ${req.path} - ${duration}ms`);
    }
  });
  next();
});
```

### **Too Many Rate Limit Hits**

```javascript
// Increase limit for specific IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skip: (req) => {
    // Skip rate limit for trusted IPs
    return req.ip === "YOUR_IP_HERE";
  },
});
```

---

## 📈 Optimization Checklist

### **Completed Optimizations**

- [x] Compression middleware (70% size reduction)
- [x] Helmet security headers
- [x] Rate limiting (prevent DoS)
- [x] MongoDB connection pooling
- [x] Socket.io memory limits
- [x] Input validation
- [x] Graceful shutdown
- [x] Memory monitoring

### **Optional Advanced Optimizations**

- [ ] Redis session storage
- [ ] Node.js clustering
- [ ] PM2 process management
- [ ] Nginx reverse proxy
- [ ] CDN for static assets
- [ ] Database query caching
- [ ] Horizontal scaling

---

## 🎯 Monthly Review

### **Performance Metrics**

- [ ] Average response time: \_\_\_ms
- [ ] Peak memory usage: \_\_\_MB
- [ ] Total users served: \_\_\_
- [ ] Error rate: \_\_\_%
- [ ] Uptime: \_\_\_%

### **Issues Found**

- [ ] Memory leaks: Yes/No
- [ ] Slow queries: Yes/No
- [ ] Rate limit issues: Yes/No
- [ ] Security vulnerabilities: Yes/No

### **Actions Needed**

- [ ] Update dependencies
- [ ] Review rate limits
- [ ] Optimize slow queries
- [ ] Add more monitoring
- [ ] Scale infrastructure

---

## 🚀 Deployment Checklist

### **Before Deploying**

- [ ] All tests passing
- [ ] No console.log statements (use logger)
- [ ] Environment variables set
- [ ] Database connected
- [ ] Rate limits configured
- [ ] Error handling tested

### **After Deploying**

- [ ] Health endpoint accessible
- [ ] Memory usage normal
- [ ] No error spikes
- [ ] Response times good
- [ ] Socket connections working

---

## 📚 Helpful Commands

### **NPM Scripts**

```bash
npm run dev          # Development with nodemon
npm start            # Production
npm test             # Run tests
```

### **Debugging**

```bash
node --inspect src/server.js     # Enable debugger
node --trace-warnings            # Show warning stack traces
node --max-old-space-size=2048  # Increase heap size to 2GB
```

### **Process Management**

```bash
# Using PM2
pm2 start src/server.js --name "collab-server"
pm2 monit            # Monitor
pm2 logs             # View logs
pm2 restart all      # Restart
pm2 stop all         # Stop
```

---

## 🎓 Key Metrics to Track

| Metric             | Tool            | Target  |
| ------------------ | --------------- | ------- |
| Memory Usage       | Task Manager    | < 150MB |
| CPU Usage          | Task Manager    | < 50%   |
| Response Time      | Health endpoint | < 200ms |
| Error Rate         | Logs            | < 1%    |
| Uptime             | PM2             | > 99.9% |
| Socket Connections | Console         | < 500   |

---

## ✅ Success Criteria

Your server is optimized when:

- ✅ Memory usage < 150MB
- ✅ Response time < 200ms
- ✅ Can handle 150+ concurrent users
- ✅ No memory leaks over time
- ✅ Proper error handling
- ✅ Security headers present
- ✅ Rate limiting working
- ✅ Graceful shutdown works

---

**Remember:** Monitor regularly, optimize based on real data! 📊
