# DailyHome Frontend Implementation Guide

## Overview
This guide provides implementation instructions for integrating the DailyHome backend's real-time WebSocket system with an Angular + Capacitor frontend.

## Backend Integration Points

### 1. Authentication & User State Management
- **Endpoint**: `GET /api/auth/me`
- **Purpose**: Determine user's current state after login
- **Response Structure**:
  ```typescript
  {
    user: { id, email, fullName, isEmailVerified },
    hasMess: boolean,
    isMessAdmin: boolean,
    currentMess: { id, name, identifierCode } | null,
    hasPendingRequest: boolean,
    pendingRequestMess: { id, name, identifierCode } | null
  }
  ```

### 2. Real-Time WebSocket Connection
- **Socket.IO Server**: Available at same URL as HTTP server
- **Authentication**: JWT token required in handshake
- **Key Events**:
  - `join-mess-room`: Join mess-specific room for updates
  - `leave-mess-room`: Leave mess room
  - `subscribe-request-status`: Subscribe to join request updates
  - `unsubscribe-request-status`: Unsubscribe from updates
  - `join-request-update`: Real-time join request status changes
  - `mess-update`: Mess-related updates (member changes, etc.)

### 3. Mess Management Endpoints
- `POST /api/mess/create` - Create new mess
- `POST /api/mess/join` - Send join request
- `GET /api/mess/check-request-status` - Check pending request status
- `POST /api/mess/cancel-request` - Cancel pending join request
- `POST /api/mess/leave` - Leave current mess
- `POST /api/mess/accept-member/:userId` - Accept join request (admin only)
- `POST /api/mess/reject-member/:userId` - Reject join request (admin only)

## Frontend Implementation Tasks

### 1. Environment Configuration
**What to do**: Set up environment files with backend URL and WebSocket configuration
- Create `src/environments/environment.ts` and `environment.prod.ts`
- Include backend API URL and WebSocket URL
- Configure for both development and production

### 2. Core Models
**What to do**: Create TypeScript interfaces for data structures
- `User` interface with id, email, fullName, isEmailVerified
- `Mess` interface with id, name, identifierCode
- `UserState` interface matching the `/api/auth/me` response
- `JoinRequest` interface for pending requests

### 3. Authentication Service
**What to do**: Create service to handle authentication and user state
- Implement login/logout methods
- Create `getCurrentUser()` method that calls `/api/auth/me`
- Store user state in BehaviorSubject for reactive updates
- Handle JWT token storage and HTTP headers

### 4. WebSocket Service
**What to do**: Create Socket.IO service for real-time communication
- Implement connection management with JWT authentication
- Create methods for joining/leaving mess rooms
- Handle subscription to join request status updates
- Implement reconnection logic for mobile app stability
- Create event emitters for real-time updates

### 5. Mess Service
**What to do**: Create service for mess-related API calls
- Implement createMess(), joinMess(), leaveMess() methods
- Add checkRequestStatus() and cancelRequest() methods
- Handle admin functions (acceptMember, rejectMember)
- Integrate with WebSocket service for real-time updates

### 6. HTTP Interceptor
**What to do**: Create interceptor for automatic JWT token handling
- Add Authorization header to all HTTP requests
- Handle 401 responses and redirect to login
- Implement token refresh logic if needed

### 7. Route Guards
**What to do**: Create guards for route protection
- `AuthGuard`: Ensure user is authenticated
- `MessGuard`: Ensure user has joined a mess
- `AdminGuard`: Ensure user is mess admin

### 8. Application Routing
**What to do**: Set up routing based on user state
- Create routes for login, signup, mess creation/joining
- Add routes for pending request status and mess dashboard
- Implement route resolvers to check user state before navigation

### 9. State Management
**What to do**: Implement reactive state management
- Use BehaviorSubject for current user state
- Create observables for real-time updates
- Implement state persistence for mobile app

### 10. Key Components to Create
**What to do**: Build these essential components
- **Login/Signup Component**: Authentication forms
- **Mess Creation Component**: Form to create new mess
- **Mess Join Component**: Form to join existing mess
- **Pending Request Component**: Show waiting status with cancel option
- **Mess Dashboard Component**: Main app interface after joining mess
- **Admin Panel Component**: For mess admins to manage members

### 11. Real-Time Features Implementation
**What to do**: Implement real-time functionality
- Subscribe to join request status updates
- Show real-time notifications for request acceptance/rejection
- Update UI immediately when mess state changes
- Handle WebSocket disconnections gracefully

### 12. Mobile App Integration (Capacitor)
**What to do**: Ensure mobile compatibility
- Test WebSocket connections on mobile devices
- Handle app background/foreground transitions
- Implement offline/online state management
- Configure for iOS and Android builds

## Implementation Flow

### 1. App Initialization
1. Check for stored JWT token
2. If token exists, call `/api/auth/me` to get user state
3. Based on response, navigate to appropriate route:
   - No mess + no pending request → Mess creation/joining
   - Has pending request → Pending request status page
   - Has mess → Mess dashboard

### 2. Real-Time Updates
1. Connect to WebSocket after successful authentication
2. Subscribe to relevant events based on user state
3. Update UI reactively when events are received
4. Handle connection errors and reconnection

### 3. User State Transitions
1. **New User**: Login → Create/Join Mess → Pending Request → Mess Dashboard
2. **Existing User**: Login → Check State → Navigate to appropriate page
3. **Real-Time Updates**: Automatic UI updates via WebSocket events

## Key Considerations

### Error Handling
- Implement proper error handling for API calls
- Handle WebSocket connection failures
- Show user-friendly error messages
- Implement retry mechanisms

### Performance
- Optimize WebSocket event handling
- Implement proper cleanup for subscriptions
- Use OnPush change detection strategy where appropriate
- Lazy load components and modules

### Security
- Secure JWT token storage
- Validate all incoming WebSocket events
- Implement proper logout and token cleanup
- Handle session expiration

### Mobile Optimization
- Test WebSocket connections on various network conditions
- Implement proper app lifecycle management
- Handle push notifications for important updates
- Optimize for battery usage

## Testing Strategy
1. Test authentication flow end-to-end
2. Verify real-time updates work correctly
3. Test mobile app functionality
4. Validate error handling scenarios
5. Test offline/online transitions

## Deployment Checklist
- Configure environment variables for production
- Set up proper CORS configuration
- Test WebSocket connections in production environment
- Verify mobile app builds work correctly
- Implement proper logging and monitoring
