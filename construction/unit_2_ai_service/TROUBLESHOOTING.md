# Troubleshooting Guide

Common issues and their solutions when running the AI Service.

## Installation Issues

### Issue: "npm: command not found"

**Cause**: Node.js is not installed

**Solution**:
1. Install Node.js from https://nodejs.org/
2. Download the LTS version (18.x or 20.x)
3. Verify installation:
   ```bash
   node --version
   npm --version
   ```

### Issue: "npm install" fails with permission errors

**Cause**: Insufficient permissions

**Solution**:
```bash
# On macOS/Linux
sudo npm install

# Or fix npm permissions (recommended)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

### Issue: Dependencies fail to install

**Cause**: Network issues or corrupted cache

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and try again
rm -rf node_modules package-lock.json
npm install
```

## Runtime Issues

### Issue: "Port 3001 already in use"

**Cause**: Another process is using port 3001

**Solution 1** - Change the port:
```bash
# Edit .env file
PORT=3002
```

**Solution 2** - Kill the process using port 3001:
```bash
# On macOS/Linux
lsof -ti:3001 | xargs kill -9

# On Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Issue: "Products file not found"

**Cause**: YAML file path is incorrect

**Symptoms**:
```
Loading products from: /path/to/products.yaml
Products file not found at /path/to/products.yaml, using empty catalog
```

**Solution**:
1. Verify the products.yaml file exists:
   ```bash
   ls ../../product/products.yaml
   ```

2. If file doesn't exist, check the correct path

3. Update `.env` file:
   ```
   PRODUCTS_CONFIG_PATH=../../product/products.yaml
   ```

4. Or use absolute path:
   ```
   PRODUCTS_CONFIG_PATH=/full/path/to/product/products.yaml
   ```

### Issue: "Failed to load products configuration"

**Cause**: YAML file is malformed or unreadable

**Solution**:
1. Check YAML syntax:
   ```bash
   # Install yamllint
   npm install -g yaml-lint
   
   # Validate YAML
   yamllint ../../product/products.yaml
   ```

2. Check file permissions:
   ```bash
   ls -l ../../product/products.yaml
   chmod 644 ../../product/products.yaml
   ```

3. Check file encoding (should be UTF-8)

### Issue: Service starts but crashes immediately

**Cause**: Syntax error or missing dependency

**Solution**:
1. Check the error message in console
2. Verify TypeScript compilation:
   ```bash
   npx tsc --noEmit
   ```
3. Reinstall dependencies:
   ```bash
   rm -rf node_modules
   npm install
   ```

## Demo Issues

### Issue: Demo fails with "ECONNREFUSED"

**Cause**: Service is not running

**Symptoms**:
```
✗ Health check failed: connect ECONNREFUSED 127.0.0.1:3001
```

**Solution**:
1. Make sure service is running:
   ```bash
   # In terminal 1
   npm run dev
   ```

2. Wait for "Server running" message

3. Run demo in separate terminal:
   ```bash
   # In terminal 2
   npm run demo
   ```

### Issue: Demo shows "All tests failed"

**Cause**: Service is running on different port

**Solution**:
1. Check which port service is using (look at startup message)
2. Update demo script if needed:
   ```typescript
   // In demo.ts, change:
   const BASE_URL = 'http://localhost:3002'; // if using port 3002
   ```

### Issue: Some tests pass, some fail

**Cause**: Partial service failure or network issues

**Solution**:
1. Check service logs for errors
2. Restart the service:
   ```bash
   # Stop with Ctrl+C
   # Start again
   npm run dev
   ```
3. Run demo again

## API Issues

### Issue: "Validation failed" errors

**Cause**: Invalid request data

**Example Error**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Validation failed",
    "details": [...]
  }
}
```

**Solution**:
Check the request matches the schema:

```typescript
// Correct recommendation request
{
  "roomType": "living_room",  // Must be valid enum value
  "dimensions": {
    "length": 5,              // Must be positive number
    "width": 4,               // Must be positive number
    "height": 3,              // Must be positive number
    "unit": "meters"          // Must be valid unit
  },
  "budget": {
    "amount": 5000,           // Must be positive number
    "currency": "SGD"         // Must be 3-letter code
  }
}
```

### Issue: Empty recommendations returned

**Cause**: No products match the criteria

**Solution**:
1. Check if products are loaded:
   ```bash
   curl http://localhost:3001/api/ai/products/search
   ```

2. Relax budget constraint:
   ```json
   {
     "budget": {
       "amount": 10000  // Increase budget
     }
   }
   ```

3. Remove category filters:
   ```json
   {
     "preferences": {
       // Remove or empty selectedCategories
     }
   }
   ```

### Issue: Chat returns generic responses

**Cause**: This is expected behavior (mock AI)

**Explanation**:
The chat service uses keyword-based responses. It's not a real AI but a demo implementation.

**Solution**:
To get better responses, use keywords like:
- "sofa", "couch" → furniture recommendations
- "budget", "price" → budget advice
- "color", "style" → style suggestions
- "small", "compact" → space-saving tips

## TypeScript Issues

### Issue: "Cannot find module" errors

**Cause**: Missing type definitions

**Solution**:
```bash
npm install --save-dev @types/node @types/express
```

### Issue: TypeScript compilation errors

**Cause**: Type mismatches or syntax errors

**Solution**:
1. Check the specific error message
2. Run type checking:
   ```bash
   npx tsc --noEmit
   ```
3. Fix reported errors
4. Restart dev server

## Performance Issues

### Issue: Slow response times

**Cause**: Large product catalog or inefficient queries

**Solution**:
1. Check product count:
   ```bash
   curl http://localhost:3001/api/ai/products/categories
   ```

2. Use pagination:
   ```bash
   curl "http://localhost:3001/api/ai/products/search?limit=10"
   ```

3. Add caching (for production)

### Issue: High memory usage

**Cause**: Large product catalog in memory

**Solution**:
1. Monitor memory:
   ```bash
   node --max-old-space-size=512 dist/index.js
   ```

2. Reduce product catalog size (for testing)

3. Implement pagination and lazy loading

## Development Issues

### Issue: Changes not reflected

**Cause**: Using `npm start` instead of `npm run dev`

**Solution**:
Use development mode with auto-reload:
```bash
npm run dev  # Uses ts-node with watch mode
```

### Issue: "ts-node: command not found"

**Cause**: ts-node not installed

**Solution**:
```bash
npm install --save-dev ts-node
```

## Environment Issues

### Issue: Environment variables not loaded

**Cause**: .env file not found or not loaded

**Solution**:
1. Verify .env file exists:
   ```bash
   ls -la .env
   ```

2. Check dotenv is loaded in code:
   ```typescript
   import dotenv from 'dotenv';
   dotenv.config();
   ```

3. Restart the service after changing .env

### Issue: CORS errors from frontend

**Cause**: Frontend origin not in ALLOWED_ORIGINS

**Solution**:
Update .env:
```
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:8080
```

## Getting Help

If you're still experiencing issues:

1. **Check the logs**: Look at console output for error messages
2. **Verify setup**: Follow QUICKSTART.md step by step
3. **Check versions**: Ensure Node.js 18+ or 20+ LTS
4. **Review docs**: Read README.md for detailed information
5. **Test endpoints**: Use curl or Postman to test individual endpoints

### Useful Commands

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# List running processes on port 3001
lsof -i :3001

# Check if service is responding
curl http://localhost:3001/health

# View service logs
npm run dev 2>&1 | tee service.log

# Test specific endpoint
curl -X POST http://localhost:3001/api/ai/recommend \
  -H "Content-Type: application/json" \
  -d '{"roomType":"living_room","dimensions":{"length":5,"width":4,"height":3,"unit":"meters"}}'
```

### Debug Mode

Enable verbose logging:
```typescript
// In src/index.ts, add:
console.log('Environment:', process.env);
console.log('Config:', {
  PORT: process.env.PORT,
  PRODUCTS_CONFIG_PATH: process.env.PRODUCTS_CONFIG_PATH,
});
```

## Still Need Help?

Create an issue with:
- Error message (full stack trace)
- Steps to reproduce
- Environment details (OS, Node version)
- What you've tried
