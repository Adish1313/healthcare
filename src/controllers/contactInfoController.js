const ContactInfo = require('../models/contactinfo');
const sequelize = require('../config/database');


exports.getAllContactInfo = async (req, res) => {
  try {
    const contactInfo = await ContactInfo.findAll();
    res.json(contactInfo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getContactInfoById = async (req, res) => {
  try {
    const contactInfo = await ContactInfo.findByPk(req.params.id);
    if (!contactInfo) {
      return res.status(404).json({ message: 'Contact info not found' });
    }
    res.json(contactInfo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createContactInfo = async (req, res) => {
  try {
    const contactInfo = await ContactInfo.create(req.body);
    res.status(201).json(contactInfo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateContactInfo = async (req, res) => {
  try {
    const contactInfo = await ContactInfo.findByPk(req.params.id);
    if (!contactInfo) {
      return res.status(404).json({ message: 'Contact info not found' });
    }
    await contactInfo.update(req.body);
    res.json(contactInfo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteContactInfo = async (req, res) => {
  try {
    const contactInfo = await ContactInfo.findByPk(req.params.id);
    if (!contactInfo) {
      return res.status(404).json({ message: 'Contact info not found' });
    }
    await contactInfo.destroy();
    res.json({ message: 'Contact info deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};