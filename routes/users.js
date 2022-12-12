var express = require('express');
var router = express.Router();
const { setCustomRoles } = require('../firebase-admin/firebase-admin.service');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.post('/setCustomClaims', async (req, res) => {
  // Get the emailId passed.
  // Req body should be of format of {email, admin, author, etc.}
  const { userId, userIdType, claims, firebaseServiceAccountCredential } = req.body;

  setCustomRoles(userId, userIdType, claims, firebaseServiceAccountCredential).then((data) => {
    // Tell client to refresh token on user.
    res.end(JSON.stringify({
      claims: data,
      message: 'Custom roles set successfully.'
    }));
  })
    .catch((error) => {
      res.status(500).send({ status: error.status || 500, message: error.message || 'Something went wrong.' });
    });

});

module.exports = router;
