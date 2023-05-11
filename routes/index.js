const express = require('express');
const router = express.Router();
let contact = require("../Contact/contactIndex.js");

/** Setting up a GET function '/getPatient' on the server
 * @param req
 * @param res
 * @returns {res.render}*/
router.get('/getPatient', contact.getPatient);

/** Setting up a POST function '/addPatient' on the server
 * @param req
 * @param res
 * @returns {res.render} */
router.post('/addPatient', contact.addPatient);

//CoronaResultsDates
/** Setting up a GET function '/getCoronaResultsDates' on the server
 * @param req
 * @param res
 * @returns {res.render}*/
router.get('/getCoronaResultsDates', contact.getCoronaResultsDates);

/** Setting up a POST function '/addCoronaResultsDates' on the server
 * @param req
 * @param res
 * @returns {res.render} */
router.post('/addCoronaResultsDates', contact.addCoronaResultsDates);


//vaccination_details
/** Setting up a GET function '/getVaccinationDetails' on the server
 * @param req
 * @param res
 * @returns {res.render}*/
router.get('/getVaccinationDetails', contact.getVaccinationDetails);
/** Setting up a POST function '/addVaccinationDetails' on the server
 * @param req
 * @param res
 * @returns {res.render} */
router.post('/addVaccinationDetails', contact.addVaccinationDetails);

router.get('/getActivePatientsByMonth', contact.getActivePatientsByMonth);
router.get('/getUnvaccinatedUsersCount', contact.getUnvaccinatedUsersCount);
router.get('/getPatientData', contact.getPatientData);


module.exports = router;