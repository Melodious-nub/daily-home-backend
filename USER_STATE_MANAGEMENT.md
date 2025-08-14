# DailyHome User State Management System

## Overview

The DailyHome backend includes a simplified user state management system that helps the frontend determine which UI to show based on the user's current state.

## User States

### 1. **No Mess State** (`hasMess: false, hasPendingRequest: false`)
- User is logged in but not part of any mess
- Can create a new mess or join an existing one
- UI should show: Create/Join Mess options

### 2. **Pending Request State** (`hasMess: false, hasPendingRequest: true`)
- User has sent a join request to a mess
- Waiting for admin approval
- UI should show: Waiting screen with cancel option

### 3. **Mess Member State** (`hasMess: true, isMessAdmin: false`)
- User is a member of a mess
- Can access all mess features
- UI should show: Main dashboard

### 4. **Mess Admin State** (`hasMess: true, isMessAdmin: true`)
- User is the admin of their mess
- Has additional admin privileges
- UI should show: Admin dashboard with extra features

## API Endpoints

### 1. Get User State
```
GET /api/auth/me
```

**Response Structure:**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "fullName": "John Doe",
    "isEmailVerified": true
  },
  "hasMess": false,
  "isMessAdmin": false,
  "currentMess": null,
  "hasPendingRequest": false,
  "pendingRequestMess": null
}
```

### 2. Check Request Status (Real-time)
```
GET /api/mess/check-request-status
```

**Response Statuses:**
- `accepted`: Request was approved, user is now a member
- `pending`: Request is still waiting for approval
- `rejected`: Request was rejected
- `none`: No request found

### 3. Cancel Join Request
```
POST /api/mess/cancel-request
```

## Frontend Implementation Guide

### 1. Initial State Check
After login, call `/api/auth/me` to determine the initial UI state:

```typescript
// Angular/TypeScript example
interface UserState {
  user: User;
  hasMess: boolean;
  isMessAdmin: boolean;
  currentMess: any;
  hasPendingRequest: boolean;
  pendingRequestMess: any;
}

async checkUserState(): Promise<void> {
  try {
    const response = await this.http.get<UserState>('/api/auth/me').toPromise();
    this.handleUserState(response);
  } catch (error) {
    console.error('Error checking user state:', error);
  }
}

handleUserState(userState: UserState): void {
  if (userState.hasMess) {
    // Show main dashboard
    this.router.navigate(['/dashboard']);
  } else if (userState.hasPendingRequest) {
    // Show waiting screen
    this.router.navigate(['/waiting-approval']);
  } else {
    // Show create/join options
    this.router.navigate(['/create-join-mess']);
  }
}
```

### 2. Real-time Request Status Checking
For users in pending request state, implement polling to check status:

```typescript
// Angular service for real-time updates
@Injectable({
  providedIn: 'root'
})
export class MessStatusService {
  private pollingInterval: any;

  startStatusPolling(): void {
    this.pollingInterval = setInterval(() => {
      this.checkRequestStatus();
    }, 5000); // Check every 5 seconds
  }

  stopStatusPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  async checkRequestStatus(): Promise<void> {
    try {
      const response = await this.http.get('/api/mess/check-request-status').toPromise();
      
      switch (response.status) {
        case 'accepted':
          this.stopStatusPolling();
          // Redirect to dashboard
          this.router.navigate(['/dashboard']);
          break;
        case 'rejected':
          this.stopStatusPolling();
          // Show rejection message and redirect to create/join
          this.router.navigate(['/create-join-mess']);
          break;
        case 'pending':
          // Continue polling
          break;
        case 'none':
          this.stopStatusPolling();
          // Redirect to create/join
          this.router.navigate(['/create-join-mess']);
          break;
      }
    } catch (error) {
      console.error('Error checking request status:', error);
    }
  }
}
```

### 3. Waiting Approval Component
Create a component for users waiting for approval:

```typescript
@Component({
  selector: 'app-waiting-approval',
  template: `
    <div class="waiting-container">
      <h2>Waiting for Approval</h2>
      <p>Your request to join "{{ messName }}" is pending.</p>
      <p>Please wait for the admin to approve your request.</p>
      
      <div class="loading-spinner">
        <!-- Add your loading spinner here -->
      </div>
      
      <button (click)="cancelRequest()" class="cancel-btn">
        Cancel Request
      </button>
    </div>
  `
})
export class WaitingApprovalComponent implements OnInit, OnDestroy {
  messName: string = '';
  private messStatusService: MessStatusService;

  ngOnInit(): void {
    // Get mess details from user state
    this.messName = this.userState.pendingRequestMess?.name || '';
    
    // Start polling for status updates
    this.messStatusService.startStatusPolling();
  }

  ngOnDestroy(): void {
    this.messStatusService.stopStatusPolling();
  }

  async cancelRequest(): Promise<void> {
    try {
      await this.http.post('/api/mess/cancel-request', {}).toPromise();
      this.router.navigate(['/create-join-mess']);
    } catch (error) {
      console.error('Error canceling request:', error);
    }
  }
}
```

## State Flow Diagram

```
Login → /api/auth/me
    ↓
┌─────────────────────────────────────┐
│ Check User State                    │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ hasMess: true?                     │
│ → Show Dashboard                    │
└─────────────────────────────────────┘
    ↓ No
┌─────────────────────────────────────┐
│ hasPendingRequest: true?            │
│ → Show Waiting Screen               │
│ → Start Polling                     │
└─────────────────────────────────────┘
    ↓ No
┌─────────────────────────────────────┐
│ → Show Create/Join Options          │
└─────────────────────────────────────┘
```

## API Response Examples

### User with Pending Request
```json
{
  "user": {
    "id": "user123",
    "email": "user@example.com",
    "fullName": "John Doe",
    "isEmailVerified": true
  },
  "hasMess": false,
  "isMessAdmin": false,
  "currentMess": null,
  "hasPendingRequest": true,
  "pendingRequestMess": {
    "id": "mess456",
    "name": "Sunshine Mess",
    "identifierCode": "123456"
  }
}
```

### Mess Admin User
```json
{
  "user": {
    "id": "user123",
    "email": "admin@example.com",
    "fullName": "Admin User",
    "isEmailVerified": true
  },
  "hasMess": true,
  "isMessAdmin": true,
  "currentMess": {
    "_id": "mess456",
    "name": "Sunshine Mess",
    "identifierCode": "123456"
  },
  "hasPendingRequest": false,
  "pendingRequestMess": null
}
```

This simplified system ensures efficient user experience and proper state management throughout the application lifecycle.
