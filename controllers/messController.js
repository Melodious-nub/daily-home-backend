const Mess = require('../models/Mess');
const User = require('../models/User');
const Member = require('../models/Member');
const { emitJoinRequestUpdate, emitMessUpdate } = require('../utils/socketEmitter');

// @desc    Create a new mess
// @route   POST /api/mess
// @access  Private
const createMess = async (req, res) => {
  try {
    const { name, address } = req.body;
    const userId = req.user._id;

    // Check if user is already in a mess
    if (req.user.currentMess) {
      return res.status(400).json({ message: 'User is already part of a mess' });
    }

    // Generate unique identifier code
    const identifierCode = await Mess.generateIdentifierCode();

    // Create new mess
    const mess = new Mess({
      name,
      address,
      identifierCode,
      admin: userId,
      members: [{ user: userId, joinedAt: new Date(), isActive: true }],
    });

    await mess.save();

    // Update user
    const user = await User.findById(userId);
    user.currentMess = mess._id;
    user.isMessAdmin = true;
    await user.save();

    // Create member record
    const member = new Member({
      user: userId,
      mess: mess._id,
      name: user.fullName,
    });
    await member.save();

    // Emit real-time update to user
    emitMessUpdate(mess._id, 'mess-created', {
      messId: mess._id,
      name: mess.name,
      identifierCode: mess.identifierCode
    });

    res.status(201).json({
      message: 'Mess created successfully',
      mess: {
        id: mess._id,
        name: mess.name,
        address: mess.address,
        identifierCode: mess.identifierCode,
        admin: mess.admin,
      },
    });
  } catch (error) {
    console.error('Create mess error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Search mess by identifier code
// @route   GET /api/mess/search/:code
// @access  Private
const searchMess = async (req, res) => {
  try {
    const { code } = req.params;

    const mess = await Mess.findOne({ 
      identifierCode: code, 
      isActive: true 
    }).populate('admin', 'fullName email');

    if (!mess) {
      return res.status(404).json({ message: 'Mess not found' });
    }

    res.json({
      mess: {
        id: mess._id,
        name: mess.name,
        address: mess.address,
        identifierCode: mess.identifierCode,
        admin: mess.admin,
      },
    });
  } catch (error) {
    console.error('Search mess error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Join a mess
// @route   POST /api/mess/join
// @access  Private
const joinMess = async (req, res) => {
  try {
    const { messId } = req.body;
    const userId = req.user._id;

    // Check if user is already in a mess
    if (req.user.currentMess) {
      return res.status(400).json({ message: 'User is already part of a mess' });
    }

    // Find mess
    const mess = await Mess.findById(messId);
    if (!mess || !mess.isActive) {
      return res.status(404).json({ message: 'Mess not found' });
    }

    // Check if user is already a member
    const existingMember = mess.members.find(m => m.user.toString() === userId.toString());
    if (existingMember && existingMember.isActive) {
      return res.status(400).json({ message: 'User is already a member of this mess' });
    }

    // Check if user already has a pending request
    const existingRequest = mess.pendingRequests.find(r => r.user.toString() === userId.toString() && r.status === 'pending');
    if (existingRequest) {
      return res.status(400).json({ message: 'You already have a pending request for this mess' });
    }

    // Add pending request
    mess.pendingRequests.push({ 
      user: userId, 
      requestedAt: new Date(), 
      status: 'pending' 
    });
    await mess.save();

    // Emit real-time update to mess admin
    emitMessUpdate(mess._id, 'new-join-request', {
      userId: userId,
      userName: req.user.fullName,
      requestedAt: new Date()
    });

    // Emit initial status to user
    emitJoinRequestUpdate(userId, 'pending', {
      id: mess._id,
      name: mess.name,
      address: mess.address,
      identifierCode: mess.identifierCode
    });

    res.json({
      message: 'Join request sent successfully. Please wait for admin approval.',
      mess: {
        id: mess._id,
        name: mess.name,
        address: mess.address,
        identifierCode: mess.identifierCode,
      },
    });
  } catch (error) {
    console.error('Join mess error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get pending join requests (admin only)
// @route   GET /api/mess/pending-requests
// @access  Private (Mess Admin)
const getPendingRequests = async (req, res) => {
  try {
    if (!req.user.isMessAdmin) {
      return res.status(403).json({ message: 'Access denied. Mess admin required' });
    }

    const mess = await Mess.findById(req.user.currentMess)
      .populate('pendingRequests.user', 'fullName email')
      .populate('admin', 'fullName email');

    if (!mess) {
      return res.status(404).json({ message: 'Mess not found' });
    }

    // Filter only pending requests
    const pendingRequests = mess.pendingRequests.filter(req => req.status === 'pending');

    res.json({
      pendingRequests: pendingRequests.map(request => ({
        id: request._id,
        user: request.user,
        requestedAt: request.requestedAt,
        status: request.status,
      })),
    });
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Accept member request (admin only)
// @route   POST /api/mess/accept-request
// @access  Private (Mess Admin)
const acceptMemberRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    const userId = req.user._id;

    if (!req.user.isMessAdmin) {
      return res.status(403).json({ message: 'Access denied. Mess admin required' });
    }

    const mess = await Mess.findById(req.user.currentMess);
    if (!mess) {
      return res.status(404).json({ message: 'Mess not found' });
    }

    // Find the pending request
    const request = mess.pendingRequests.find(r => r._id.toString() === requestId && r.status === 'pending');
    if (!request) {
      return res.status(404).json({ message: 'Request not found or already processed' });
    }

    const requestingUserId = request.user;

    // Check if user is already a member
    const existingMember = mess.members.find(m => m.user.toString() === requestingUserId.toString());
    if (existingMember && existingMember.isActive) {
      return res.status(400).json({ message: 'User is already a member of this mess' });
    }

    // Update request status to approved
    request.status = 'approved';

    // Add user to mess members
    if (existingMember) {
      existingMember.isActive = true;
      existingMember.joinedAt = new Date();
    } else {
      mess.members.push({ user: requestingUserId, joinedAt: new Date(), isActive: true });
    }

    await mess.save();

    // Update user
    const user = await User.findById(requestingUserId);
    if (user) {
      user.currentMess = mess._id;
      user.isMessAdmin = false;
      await user.save();
    }

    // Create or update member record
    let member = await Member.findOne({ user: requestingUserId, mess: mess._id });
    if (member) {
      member.isActive = true;
      member.name = user.fullName;
    } else {
      member = new Member({
        user: requestingUserId,
        mess: mess._id,
        name: user.fullName,
      });
    }
    await member.save();

    // Emit real-time updates
    const messData = {
      id: mess._id,
      name: mess.name,
      address: mess.address,
      identifierCode: mess.identifierCode,
      admin: {
        id: mess.admin,
        fullName: req.user.fullName,
        email: req.user.email
      }
    };

    // Emit to requesting user
    emitJoinRequestUpdate(requestingUserId, 'accepted', messData);

    // Emit to mess members
    emitMessUpdate(mess._id, 'member-joined', {
      userId: requestingUserId,
      userName: user.fullName,
      joinedAt: new Date()
    });

    res.json({
      message: 'Member request accepted successfully',
      user: {
        id: requestingUserId,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Accept member request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reject member request (admin only)
// @route   POST /api/mess/reject-request
// @access  Private (Mess Admin)
const rejectMemberRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    const userId = req.user._id;

    if (!req.user.isMessAdmin) {
      return res.status(403).json({ message: 'Access denied. Mess admin required' });
    }

    const mess = await Mess.findById(req.user.currentMess);
    if (!mess) {
      return res.status(404).json({ message: 'Mess not found' });
    }

    // Find the pending request
    const request = mess.pendingRequests.find(r => r._id.toString() === requestId && r.status === 'pending');
    if (!request) {
      return res.status(404).json({ message: 'Request not found or already processed' });
    }

    // Update request status to rejected
    request.status = 'rejected';
    await mess.save();

    // Emit real-time update to requesting user
    const messData = {
      id: mess._id,
      name: mess.name,
      address: mess.address,
      identifierCode: mess.identifierCode
    };

    emitJoinRequestUpdate(request.user, 'rejected', messData);

    res.json({
      message: 'Member request rejected successfully',
    });
  } catch (error) {
    console.error('Reject member request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Leave mess
// @route   POST /api/mess/leave
// @access  Private
const leaveMess = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if user is in a mess
    if (!req.user.currentMess) {
      return res.status(400).json({ message: 'User is not part of any mess' });
    }

    const mess = await Mess.findById(req.user.currentMess);
    if (!mess) {
      return res.status(404).json({ message: 'Mess not found' });
    }

    // Check if user is admin
    if (mess.admin.toString() === userId.toString()) {
      return res.status(400).json({ message: 'Mess admin cannot leave. Transfer admin role first.' });
    }

    // Remove user from mess members
    const memberIndex = mess.members.findIndex(m => m.user.toString() === userId.toString());
    if (memberIndex !== -1) {
      mess.members[memberIndex].isActive = false;
      await mess.save();
    }

    // Update user
    const user = await User.findById(userId);
    user.currentMess = null;
    user.isMessAdmin = false;
    await user.save();

    // Update member record
    const member = await Member.findOne({ user: userId, mess: mess._id });
    if (member) {
      member.isActive = false;
      await member.save();
    }

    // Emit real-time update to mess members
    emitMessUpdate(mess._id, 'member-left', {
      userId: userId,
      userName: user.fullName,
      leftAt: new Date()
    });

    res.json({ message: 'Successfully left the mess' });
  } catch (error) {
    console.error('Leave mess error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get mess details
// @route   GET /api/mess
// @access  Private
const getMessDetails = async (req, res) => {
  try {
    if (!req.user.currentMess) {
      return res.status(400).json({ message: 'User is not part of any mess' });
    }

    const mess = await Mess.findById(req.user.currentMess)
      .populate('admin', 'fullName email')
      .populate('members.user', 'fullName email');

    if (!mess) {
      return res.status(404).json({ message: 'Mess not found' });
    }

    // Filter active members
    const activeMembers = mess.members.filter(m => m.isActive);

    res.json({
      mess: {
        id: mess._id,
        name: mess.name,
        address: mess.address,
        identifierCode: mess.identifierCode,
        admin: mess.admin,
        members: activeMembers,
        memberCount: activeMembers.length,
      },
    });
  } catch (error) {
    console.error('Get mess details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove member from mess (admin only)
// @route   DELETE /api/mess/members/:memberId
// @access  Private (Mess Admin)
const removeMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const userId = req.user._id;

    if (!req.user.isMessAdmin) {
      return res.status(403).json({ message: 'Access denied. Mess admin required' });
    }

    const mess = await Mess.findById(req.user.currentMess);
    if (!mess) {
      return res.status(404).json({ message: 'Mess not found' });
    }

    // Check if trying to remove admin
    if (mess.admin.toString() === memberId) {
      return res.status(400).json({ message: 'Cannot remove mess admin' });
    }

    // Remove member from mess
    const memberIndex = mess.members.findIndex(m => m.user.toString() === memberId);
    if (memberIndex !== -1) {
      mess.members[memberIndex].isActive = false;
      await mess.save();
    }

    // Update user
    const user = await User.findById(memberId);
    if (user) {
      user.currentMess = null;
      user.isMessAdmin = false;
      await user.save();
    }

    // Update member record
    const member = await Member.findOne({ user: memberId, mess: mess._id });
    if (member) {
      member.isActive = false;
      await member.save();
    }

    // Emit real-time updates
    emitMessUpdate(mess._id, 'member-removed', {
      userId: memberId,
      userName: user?.fullName,
      removedAt: new Date()
    });

    // Emit to removed user
    emitJoinRequestUpdate(memberId, 'removed', {
      id: mess._id,
      name: mess.name,
      identifierCode: mess.identifierCode
    });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Check pending request status (for real-time updates)
// @route   GET /api/mess/check-request-status
// @access  Private
const checkRequestStatus = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if user has a current mess (request was accepted)
    if (req.user.currentMess) {
      const mess = await Mess.findById(req.user.currentMess)
        .select('name identifierCode address admin')
        .populate('admin', 'fullName email');

      return res.json({
        status: 'accepted',
        message: 'Your join request has been accepted!',
        mess: {
          id: mess._id,
          name: mess.name,
          address: mess.address,
          identifierCode: mess.identifierCode,
          admin: mess.admin,
        },
      });
    }

    // Check for pending request
    const pendingRequest = await Mess.findOne({
      'pendingRequests.user': userId,
      'pendingRequests.status': 'pending'
    });

    if (pendingRequest && pendingRequest.pendingRequests) {
      const requestDetails = pendingRequest.pendingRequests.find(
        req => req.user.toString() === userId.toString() && req.status === 'pending'
      );

      if (requestDetails) {
        return res.json({
          status: 'pending',
          message: 'Your join request is still pending',
          mess: {
            id: pendingRequest._id,
            name: pendingRequest.name,
            address: pendingRequest.address,
            identifierCode: pendingRequest.identifierCode,
          },
          request: {
            id: requestDetails._id,
            requestedAt: requestDetails.requestedAt,
          },
        });
      }
    }

    // Check for rejected request
    const rejectedRequest = await Mess.findOne({
      'pendingRequests.user': userId,
      'pendingRequests.status': 'rejected'
    });

    if (rejectedRequest && rejectedRequest.pendingRequests) {
      const rejectedRequestDetails = rejectedRequest.pendingRequests.find(
        req => req.user.toString() === userId.toString() && req.status === 'rejected'
      );

      if (rejectedRequestDetails) {
        return res.json({
          status: 'rejected',
          message: 'Your join request was rejected',
          mess: {
            id: rejectedRequest._id,
            name: rejectedRequest.name,
            identifierCode: rejectedRequest.identifierCode,
          },
        });
      }
    }

    // No request found
    return res.json({
      status: 'none',
      message: 'No pending request found',
    });

  } catch (error) {
    console.error('Check request status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Cancel join request
// @route   POST /api/mess/cancel-request
// @access  Private
const cancelJoinRequest = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if user has a current mess
    if (req.user.currentMess) {
      return res.status(400).json({ message: 'You are already a member of a mess' });
    }

    // Find mess with pending request from this user
    const mess = await Mess.findOne({
      'pendingRequests.user': userId,
      'pendingRequests.status': 'pending'
    });

    if (!mess) {
      return res.status(404).json({ message: 'No pending request found' });
    }

    // Remove the pending request
    mess.pendingRequests = mess.pendingRequests.filter(
      req => !(req.user.toString() === userId.toString() && req.status === 'pending')
    );

    await mess.save();

    // Emit real-time update to mess admin
    emitMessUpdate(mess._id, 'request-cancelled', {
      userId: userId,
      userName: req.user.fullName,
      cancelledAt: new Date()
    });

    // Emit to user
    emitJoinRequestUpdate(userId, 'cancelled', {
      id: mess._id,
      name: mess.name,
      identifierCode: mess.identifierCode
    });

    res.json({
      message: 'Join request cancelled successfully',
      status: 'cancelled',
    });
  } catch (error) {
    console.error('Cancel join request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createMess,
  searchMess,
  joinMess,
  leaveMess,
  getMessDetails,
  removeMember,
  getPendingRequests,
  acceptMemberRequest,
  rejectMemberRequest,
  checkRequestStatus,
  cancelJoinRequest,
}; 