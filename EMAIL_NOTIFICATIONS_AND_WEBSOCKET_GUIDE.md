# DailyHome - Email Notifications & WebSocket Real-time System

## 📧 Email Notifications for Mess Request Status

### Overview
The DailyHome system now includes comprehensive email notifications for all mess request status changes. Users receive instant email notifications when their join requests are accepted, rejected, or cancelled.

### Email Notification Types

#### 1. Request Accepted Email
- **Trigger**: When admin accepts a user's join request
- **Recipient**: The user whose request was accepted
- **Subject**: "DailyHome - Your Mess Join Request Has Been Accepted! 🎉"
- **Content**: 
  - Welcome message
  - Mess details (name, address, identifier code)
  - Instructions to access dashboard

#### 2. Request Rejected Email
- **Trigger**: When admin rejects a user's join request
- **Recipient**: The user whose request was rejected
- **Subject**: "DailyHome - Mess Join Request Update"
- **Content**:
  - Rejection notification
  - Mess details
  - Encouragement to try other messes



### Implementation Details

#### Email Service Functions
```javascript
// New functions added to utils/emailService.js
sendMessRequestAcceptedEmail(email, fullName, messName, messAddress, identifierCode)
sendMessRequestRejectedEmail(email, fullName, messName, identifierCode)
```

#### Controller Integration
Email notifications are automatically sent in these controller functions:
- `acceptMemberRequest()` - Sends acceptance email
- `rejectMemberRequest()` - Sends rejection email

#### Error Handling
- Email failures don't break the main functionality
- All email errors are logged for debugging
- Graceful degradation ensures system stability

---

## 🔌 WebSocket Real-time System

### Overview
The WebSocket system provides instant real-time updates for mess request status changes and other mess-related activities.

### WebSocket Events

#### 1. Join Request Status Updates
**Event**: `join-request-update`
**Emitted to**: Specific user's request status room
**Data Structure**:
```javascript
{
  status: 'accepted' | 'rejected' | 'cancelled' | 'pending',
  message: string,
  timestamp: string,
  mess: {
    id: string,
    name: string,
    address: string,
    identifierCode: string,
    admin?: {
      id: string,
      fullName: string,
      email: string
    }
  }
}
```

#### 2. Mess Updates
**Event**: `mess-update`
**Emitted to**: Mess room members
**Data Structure**:
```javascript
{
  type: 'new-join-request' | 'member-joined' | 'member-left' | 'member-removed' | 'request-cancelled',
  data: any,
  timestamp: string
}
```

#### 3. User Notifications
**Event**: `notification`
**Emitted to**: User's personal room
**Data Structure**:
```javascript
{
  type: string,
  data: any,
  timestamp: string
}
```

### WebSocket Rooms

#### 1. User Personal Room
- **Room Name**: `user:${userId}`
- **Purpose**: User-specific notifications
- **Auto-join**: On connection

#### 2. Request Status Room
- **Room Name**: `request-status:${userId}`
- **Purpose**: Join request status updates
- **Join**: When user subscribes to request status

#### 3. Mess Room
- **Room Name**: `mess:${messId}`
- **Purpose**: Mess-specific updates
- **Join**: When user joins mess room

### Client-Side Events

#### Subscribe to Request Status
```javascript
socket.emit('subscribe-request-status');
```

#### Unsubscribe from Request Status
```javascript
socket.emit('unsubscribe-request-status');
```

#### Join Mess Room
```javascript
socket.emit('join-mess-room', messId);
```

#### Leave Mess Room
```javascript
socket.emit('leave-mess-room', messId);
```

#### Ping/Pong Health Check
```javascript
socket.emit('ping');
socket.on('pong', (data) => {
  console.log('Pong received:', data);
});
```

### Real-time Flow Examples

#### 1. User Sends Join Request
1. User submits join request via API
2. Server adds request to pending list
3. Server emits `mess-update` to mess room (new-join-request)
4. Admin receives real-time notification

#### 2. Admin Accepts Request
1. Admin accepts request via API
2. Server updates request status to 'approved'
3. Server adds user to mess members
4. Server emits `join-request-update` to user (accepted)
5. Server emits `mess-update` to mess room (member-joined)
6. Server sends email notification to user
7. User receives instant real-time update + email

#### 3. Admin Rejects Request
1. Admin rejects request via API
2. Server updates request status to 'rejected'
3. Server emits `join-request-update` to user (rejected)
4. Server sends email notification to user
5. User receives instant real-time update + email

#### 4. User Cancels Request
1. User cancels request via API
2. Server removes request from pending list
3. Server emits `mess-update` to mess room (request-cancelled)
4. Server emits `join-request-update` to user (cancelled)
5. Admin receives real-time notification

### Connection Management

#### Authentication
- JWT token required in handshake
- Token validated on connection
- User info attached to socket

#### Reconnection
- Automatic reconnection enabled
- Exponential backoff strategy
- Connection health monitoring

#### Error Handling
- Comprehensive error logging
- Graceful connection failures
- User-friendly error messages

---

## 🧪 Testing WebSocket Functionality

### Test Script
Use the provided `test-websocket.js` script to verify WebSocket functionality:

```bash
# Install socket.io-client if not already installed
npm install socket.io-client

# Update TEST_TOKEN in the script with a valid JWT token
# Run the test
node test-websocket.js
```

### Test Scenarios
1. **Connection Test**: Verifies WebSocket connection with authentication
2. **Request Status Subscription**: Tests real-time request status updates
3. **Mess Room Functionality**: Tests mess-specific real-time updates
4. **Ping/Pong Health Check**: Verifies connection health monitoring

### Manual Testing
1. Open browser console on frontend
2. Connect to WebSocket with valid JWT token
3. Subscribe to request status updates
4. Perform actions (send request, accept/reject) from another client
5. Verify real-time updates are received

---

## 🔧 Configuration

### Environment Variables
Ensure these are set in your `.env` file:
```env
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
JWT_SECRET=your_jwt_secret
```

### Email Configuration
- Gmail SMTP with App Password required
- HTML email templates with responsive design
- Professional styling with DailyHome branding

### WebSocket Configuration
- CORS enabled for all origins (development)
- JWT authentication middleware
- Automatic reconnection with exponential backoff
- Connection health monitoring

---

## 📱 Frontend Integration

### Angular Service Example
```typescript
// socket.service.ts
export class SocketService {
  private socket: Socket;

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(environment.apiUrl, {
        auth: { token },
        transports: ['websocket', 'polling']
      });

      this.socket.on('connect', () => {
        console.log('Connected to WebSocket');
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        reject(error);
      });
    });
  }

  subscribeToRequestStatus(): void {
    this.socket.emit('subscribe-request-status');
  }

  onJoinRequestUpdate(callback: (data: any) => void): void {
    this.socket.on('join-request-update', callback);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
```

### React Hook Example
```javascript
// useWebSocket.js
import { useEffect, useRef } from 'react';
import io from 'socket.io-client';

export const useWebSocket = (token) => {
  const socketRef = useRef();

  useEffect(() => {
    if (token) {
      socketRef.current = io(process.env.REACT_APP_API_URL, {
        auth: { token },
        transports: ['websocket', 'polling']
      });

      socketRef.current.on('connect', () => {
        console.log('WebSocket connected');
      });

      socketRef.current.on('join-request-update', (data) => {
        console.log('Request status update:', data);
        // Handle real-time update
      });

      return () => {
        socketRef.current.disconnect();
      };
    }
  }, [token]);

  return socketRef.current;
};
```

---

## 🚀 Benefits

### Email Notifications
- ✅ Instant user awareness of request status
- ✅ Professional communication
- ✅ Backup for offline users
- ✅ Detailed information included

### WebSocket Real-time System
- ✅ Instant UI updates
- ✅ No polling required
- ✅ Efficient resource usage
- ✅ Professional user experience
- ✅ Scalable architecture

### Combined Benefits
- ✅ Smart notification system (real-time + email for important events)
- ✅ Reliable communication
- ✅ Enhanced user experience
- ✅ Professional messaging system

---

## 🔍 Troubleshooting

### Email Issues
1. Check Gmail App Password configuration
2. Verify EMAIL_USER and EMAIL_PASS in .env
3. Check email service logs
4. Test email sending manually

### WebSocket Issues
1. Verify JWT token validity
2. Check CORS configuration
3. Test connection with provided test script
4. Monitor server logs for connection errors

### Real-time Update Issues
1. Ensure proper room subscription
2. Verify event emission in server logs
3. Check client-side event listeners
4. Test with multiple clients

---

This implementation provides a robust, professional real-time system with comprehensive email notifications for the DailyHome mess management application.
