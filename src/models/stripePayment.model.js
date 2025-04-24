const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const StripePayment = sequelize.define('StripePayment', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: () => uuidv4()
  },
  stripe_event_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'stripe_event_id'
  },
  stripe_object_id: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Session ID, Payment Intent ID, etc.',
    field: 'stripe_object_id'
  },
  event_type: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'checkout.session.completed, payment_intent.succeeded, etc.',
    field: 'event_type'
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'usd'
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'succeeded'
  },
  customer_email: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'customer_email'
  },
  patient_email: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Reference to PatientWallet.email',
    field: 'patient_email'
  },
  metadata: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '{}',
    get() {
      const value = this.getDataValue('metadata');
      return value ? JSON.parse(value) : {};
    },
    set(value) {
      this.setDataValue('metadata', JSON.stringify(value));
    }
  },
  rawData: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Stringified JSON of the full Stripe event data'
  }
}, {
  tableName: 'stripe_payments',
  timestamps: true,
  indexes: [
    {
      fields: ['patient_email'],
      name: 'idx_stripe_payments_patient_email'
    },
    {
      fields: ['stripe_object_id'],
      name: 'idx_stripe_payments_object_id'
    }
  ]
});

module.exports = StripePayment;
