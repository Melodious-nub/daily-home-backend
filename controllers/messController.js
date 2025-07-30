const Mess = require('../models/Mess');
const User = require('../models/User');
const Member = require('../models/Member');

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

    // Add user to mess members
    if (existingMember) {
      existingMember.isActive = true;
      existingMember.joinedAt = new Date();
    } else {
      mess.members.push({ user: userId, joinedAt: new Date(), isActive: true });
    }
    await mess.save();

    // Update user
    const user = await User.findById(userId);
    user.currentMess = mess._id;
    user.isMessAdmin = false;
    await user.save();

    // Create or update member record
    let member = await Member.findOne({ user: userId, mess: mess._id });
    if (member) {
      member.isActive = true;
      member.name = user.fullName;
    } else {
      member = new Member({
        user: userId,
        mess: mess._id,
        name: user.fullName,
      });
    }
    await member.save();

    res.json({
      message: 'Successfully joined the mess',
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

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
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
}; 