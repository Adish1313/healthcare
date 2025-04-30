/**
 * Application configuration settings
 */
module.exports = {
  // Video call settings
  VIDEO_CALL_FEE: 500, // Amount in INR
  
  // Currency conversion settings
  CURRENCY: {
    USD_TO_INR: 100, // 1 USD = 100 INR conversion rate
    DEFAULT_CURRENCY: 'INR'
  },
  
  // Jitsi settings
  JITSI: {
    BASE_URL: 'https://meet.jit.si',
    ROOM_PREFIX: 'healthoasis'
  }
};
