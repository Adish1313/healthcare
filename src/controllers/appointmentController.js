const Appointment = require('../models/appointment');
// const Payment = require('../models/payments'); // (Removed as payment is not needed for appointments)


// Create Appointment
exports.createAppointment = async (req, res) => {
  try {
    const {
      id,
      fullname,
      email,
      phone,
      department,
      appointment_date,
      appointment_time,
      message = ''
    } = req.body;

    if (!fullname || !email || !phone || !department || !appointment_date || !appointment_time) {
      return res.status(400).json({ error: 'Please fill in all required fields.' });
    }

    const newAppointment = await Appointment.create({
      id,
      fullname,
      email,
      phone,
      department,
      appointment_date,
      appointment_time,
      message
    });

    res.status(201).json({ message: 'Appointment created successfully', appointment: newAppointment });
  } catch (err) {
    console.error('Create Appointment Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get All Appointments with Payment Info
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      include: [
        {
          model: Payment,
          attributes: ['status', 'amount', 'currency', 'stripePaymentIntentId', 'createdAt']
        }
      ]
    });

    res.json(appointments);
  } catch (err) {
    console.error('Error in getAllAppointments:', err); 
    res.status(500).json({ error: 'Failed to fetch appointments', details: err.message });
  }
};

// Get Appointment by ID with Payment Info
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: Payment,
          attributes: ['status', 'amount', 'currency', 'stripePaymentIntentId', 'createdAt']
        }
      ]
    });

    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    res.json(appointment);
  } catch (err) {
    console.error('Error fetching appointment by ID:', err);
    res.status(500).json({ error: 'Error fetching appointment' });
  }
};

// Dummy Data for Testing
exports.getDummyAppointments = (req, res) => {
  const dummyAppointments = [
    {
      id: '1',
      fullname: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      department: 'Cardiology',
      appointment_date: '2025-04-20',
      appointment_time: '10:30',
      message: 'Routine checkup',
      doctor_id: 'doc1'
    },
    {
      id: '2',
      fullname: 'Jane Smith',
      email: 'jane@example.com',
      phone: '9876543210',
      department: 'Neurology',
      appointment_date: '2025-04-21',
      appointment_time: '14:00',
      message: 'Migraine consultation',
      doctor_id: 'doc2'
    }
  ];
  res.json(dummyAppointments);
};

// Update Appointment
exports.updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

    await appointment.update(req.body);
    res.json({ message: 'Appointment updated', appointment });
  } catch (err) {
    console.error('Error updating appointment:', err);
    res.status(500).json({ error: 'Error updating appointment' });
  }
};

// Delete Appointment
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

    await appointment.destroy();
    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    console.error('Error deleting appointment:', err);
    res.status(500).json({ error: 'Error deleting appointment' });
  }
};
