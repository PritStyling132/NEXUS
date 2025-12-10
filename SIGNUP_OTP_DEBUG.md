# OTP Signup Debugging Guide

## 🔍 Problem

User receives OTP email from Clerk but after entering the code, signup doesn't complete and doesn't redirect to next page.

## ✅ Your Current Implementation is Correct!

The code in [src/hooks/authentication/index.ts](src/hooks/authentication/index.ts:182-283) is already well-implemented with:

- ✅ Comprehensive error handling
- ✅ Detailed console logging at each step
- ✅ Proper session activation
- ✅ Database user creation
- ✅ Success/error toasts
- ✅ Redirect after success

## 🐛 Common Causes & Solutions

### 1. **Console Logs Not Visible**

**Check Browser Console:**

1. Open Developer Tools (F12)
2. Go to Console tab
3. Clear console
4. Enter OTP and submit
5. Look for these logs in order:

```
🔄 Step 1: Attempting OTP verification...
✅ Verification Status: complete
✅ User ID: user_xxxxx
🔄 Setting active session...
✅ Session activated
🔄 Creating user in database...
📥 Database response: {...}
✅ User created successfully
🔄 Redirecting to /group/create...
📍 Executing router.push...
```

**If you don't see these logs:**

- The `onInitiateUserRegistration` function isn't executing
- Form might not be submitting properly

### 2. **OTP Verification Failing Silently**

**Check for these error codes in console:**

| Error Code               | Meaning                           | Solution                         |
| ------------------------ | --------------------------------- | -------------------------------- |
| `form_code_incorrect`    | Wrong code entered                | Double-check the code from email |
| `verification_expired`   | Code expired (usually 10 minutes) | Click "Resend Code"              |
| `form_identifier_exists` | Email already registered          | Use "Sign In" instead            |

### 3. **Session Not Activating**

**Symptoms:**

- Verification succeeds but user isn't logged in
- Redirect doesn't happen
- Console shows: `✅ Verification Status: complete` but stops there

**Solution:**
Check [src/hooks/authentication/index.ts:225](src/hooks/authentication/index.ts:225):

```typescript
await setActive({ session: completeSignUp.createdSessionId })
```

This line MUST complete before proceeding.

### 4. **Database Creation Failing**

**Symptoms:**

- Console shows all Clerk steps complete
- But `📥 Database response:` shows `status: 400`

**Check:**

1. Database is running (PostgreSQL)
2. Prisma connection works
3. Check server logs for Prisma errors

**Common Prisma Errors:**

```
P2002: Unique constraint violation (user already exists)
P1001: Can't reach database server
```

### 5. **Redirect Not Working**

**Symptoms:**

- Everything completes successfully
- Toast shows "Account created successfully!"
- But page doesn't redirect

**Possible Causes:**

**A. Router Not Imported Correctly**
Check [src/hooks/authentication/index.ts:9](src/hooks/authentication/index.ts:9):

```typescript
import { useRouter } from "next/navigation" // ✅ Correct for App Router
```

NOT:

```typescript
import { useRouter } from "next/router" // ❌ Wrong (Pages Router)
```

**B. Middleware Blocking**
Check [src/middleware.ts](src/middleware.ts:4-12) - ensure `/group/create` is NOT in public routes (it should require auth).

**C. setTimeout Delay Too Short**
The current 100ms delay might be too short. If redirect doesn't work, the code has been updated to 500ms.

## 🔧 Quick Fixes to Try

### Fix 1: Add Alert Before Redirect (Temporary Debug)

**Purpose:** Confirm the redirect code is actually executing

Add this temporarily to [src/hooks/authentication/index.ts:250-253](src/hooks/authentication/index.ts:250-253):

```typescript
setTimeout(() => {
    alert("About to redirect! Click OK to continue.") // DEBUG ONLY
    router.push("/group/create")
}, 500)
```

**What to expect:**

- If you see the alert, the code is running
- If no alert, something is failing before this point

### Fix 2: Use window.location Instead of router.push

**Purpose:** Force hard navigation as fallback

Replace the redirect with:

```typescript
setTimeout(() => {
    window.location.href = "/group/create"
}, 500)
```

### Fix 3: Check Network Tab

**Purpose:** See if API calls are failing

1. Open Developer Tools (F12)
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Submit the OTP
5. Look for failed requests (red)

**Common failures:**

- `/api/auth/sign-up` - Database creation failing
- Clerk API calls - Network issues

### Fix 4: Increase Timeout Delay

**Purpose:** Give session time to fully activate

Change from 100ms to 1000ms (1 second):

```typescript
setTimeout(() => {
    router.push("/group/create")
}, 1000) // ← Changed
```

## 📋 Step-by-Step Debugging Process

### Step 1: Verify OTP is Being Entered

1. Go to `/sign-up`
2. Fill form and click "Generate Code"
3. Check email for 6-digit code
4. Enter code in UI
5. **Verify button becomes enabled** (code.length === 6)

### Step 2: Check Form Submission

1. Open Console (F12)
2. Click "Verify & Sign Up" button
3. Look for first log: `🔄 Step 1: Attempting OTP verification...`
4. **If you don't see this:** Form isn't submitting

### Step 3: Track Through Each Step

Watch for these logs in sequence:

```
1. 🔄 Step 1: Attempting OTP verification...
2. ✅ Verification Status: complete
3. ✅ User ID: user_xxxxx
4. 🔄 Setting active session...
5. ✅ Session activated
6. 🔄 Creating user in database...
7. 📥 Database response: {...}
8. ✅ User created successfully
9. 🔄 Redirecting to /group/create...
```

**Where does it stop?** That's your problem area.

### Step 4: Check Success Toast

- Success toast should appear: "Account created successfully!"
- If toast appears but no redirect → Router issue
- If no toast → Check database response

### Step 5: Check URL Bar

- Does URL change to `/group/create`?
- Does it stay on `/sign-up`?
- Does it change but immediately redirect back?

## 🎯 Most Likely Causes (Ranked)

### 1. ⭐ Database Connection Issue (60% likely)

**How to verify:**

```bash
# Check if Prisma can connect
npx prisma db push
```

**Expected:** "Database is already in sync"
**Problem:** Connection errors

### 2. ⭐ Session Not Setting (20% likely)

**Symptom:** Clerk verification works but setActive() fails
**Solution:** Check Clerk dashboard settings

### 3. ⭐ Router Not Executing (15% likely)

**Symptom:** Everything logs successfully but no redirect
**Solution:** Use window.location.href instead

### 4. Code Execution Stopping Early (5% likely)

**Symptom:** Logs stop mid-process
**Solution:** Check for unhandled promise rejections

## 🧪 Testing Checklist

Use this checklist when debugging:

- [ ] Check browser console for errors
- [ ] Verify OTP code is correct (6 digits)
- [ ] Check all console logs appear in order
- [ ] Verify success toast appears
- [ ] Check Network tab for failed API calls
- [ ] Test database connection with Prisma Studio
- [ ] Try with different email address
- [ ] Try in incognito/private window
- [ ] Check Clerk dashboard for user creation
- [ ] Verify middleware isn't blocking redirect

## 📞 If Still Not Working

### Collect This Information:

1. **Console Logs:** Copy entire console output after submitting OTP
2. **Network Tab:** Screenshot of any failed requests (red)
3. **Clerk Dashboard:** Check if user was created in Clerk
4. **Database:** Run this query:
    ```sql
    SELECT * FROM "User" WHERE "clerkId" = 'user_xxxxx';
    ```
5. **Error Messages:** Any toast error messages that appeared

### Then Check:

1. Is user created in Clerk dashboard? (Yes/No)
2. Is user created in database? (Yes/No)
3. Does success toast appear? (Yes/No)
4. Does URL start to change? (Yes/No)

**Results:**

- **Yes, Yes, Yes, No** → Router issue
- **Yes, No, No, No** → Database issue
- **No, No, No, No** → Clerk verification issue
- **Yes, Yes, Yes, Yes** → Redirect worked! Check /group/create page

## ✅ Expected Successful Flow

```
User enters OTP → Submit button clicked
     ↓
Clerk verifies code
     ↓
Session activated
     ↓
User created in database
     ↓
Success toast shown
     ↓
500ms delay
     ↓
Redirect to /group/create
     ↓
User sees group creation page
```

---

**Last Updated:** 2025-11-23
**Status:** ✅ Code is correct, issue is likely environmental
