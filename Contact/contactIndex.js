const bcrypt = require('bcrypt')
const Cookies = require('cookies');
var mysql = require('mysql');
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "corona"
});

module.exports = (function() {
    //users:function for retrieving patient data from the user table by entering the key that is id
    function getPatient(req, res, next) {
        connection.connect(function(err) {
            if (err) throw err;
            var sql = "SELECT * FROM users WHERE id = '" + req.query.id + "';";
            connection.query(sql, function (err, result, fields) {
                if (err) throw err;
                for (let i = 0; i < result.length; i++) {
                    const date = new Date(result[i].dob);
                    result[i].dob = date.toLocaleDateString('en-CA');
                }
                res.send(result);
            });
        });
    }

   //users:The function of inserting a new patient into the DB
    function addPatient(req, res, next) {
        const checkQuery = `SELECT COUNT(*) as count FROM users WHERE id = ${mysql.escape(req.query.id)}`;
        connection.query(checkQuery, function (error, results) {
            if (error) throw error;
            const count = results[0].count;
            if (count === 0) {
                const insertQuery = `INSERT INTO users VALUES (${mysql.escape(req.query.id)}, ${mysql.escape(req.query.first_name)}, ${mysql.escape(req.query.last_name)},
                       ${mysql.escape(req.query.city)}, ${mysql.escape(req.query.street)}, ${req.query.house_number}, ${mysql.escape(req.query.dob)}, ${req.query.telephone}, ${req.query.mobile_phone})`;
                connection.query(insertQuery, function (err, result) {
                    if (err) throw err;
                    res.send('User registered successfully.');
                });
            } else {
                res.send('User already exists.');
            }
        });
    }


//CoronaResultsDates:Data entry function for the Corona results table (date of recovery/positive test)
    function getCoronaResultsDates(req, res, next) {
        connection.connect(function(err) {
            if (err) throw err;
            var sql = "SELECT * FROM corona_results_dates WHERE id = '" + req.query.id + "';";
            connection.query(sql, function (err, result, fields) {
                if (err) throw err;
                for (let i = 0; i < result.length; i++) {
                    const datePositiveResult = new Date(result[i].date_positive_result);
                    result[i].date_positive_result = datePositiveResult.toLocaleDateString('en-CA');
                    const dateRecovery = new Date(result[i].date_recovery);
                    result[i].date_recovery = dateRecovery.toLocaleDateString('en-CA');
                }
                res.send(result);
            });
        });
    }
//CoronaResultsDates:Data retrieval function tabulates corona results with the key id
    function addCoronaResultsDates(req, res, next) {
        const checkUserQuery = `SELECT COUNT(*) as count FROM users WHERE id = ${mysql.escape(req.query.id)}`;
        connection.query(checkUserQuery, (error, userResults) => {
            if (error) throw error;
            const userCount = userResults[0].count;
            if (userCount === 0) {
                res.send('User is not registered in the users table.');}
            else {
                const checkQuery = `SELECT COUNT(*) as count FROM corona_results_dates WHERE id = ${mysql.escape(req.query.id)}`;
                connection.query(checkQuery, (error, results) => {
                    if (error) throw error;
                    const count = results[0].count;
                    if (count > 0) {
                        res.send('User is already registered in the corona results dates.');
                    } else {
                        const insertQuery = `INSERT INTO corona_results_dates VALUES (${mysql.escape(req.query.id)}, "${req.query.date_positive_result}", "${req.query.date_recovery}")`;
                        connection.query(insertQuery, (err, result) => {
                            if (err) throw error;
                            res.send('Corona results dates added successfully.');
                        });
                    }
                });
            }
        });
    }
//vaccination_details:function to insert data into the vaccination details table (date of vaccination, type)
    function getVaccinationDetails(req, res, next) {
        connection.connect(function(err) {
            if (err) throw err;
            var sql = "SELECT * FROM vaccination_details WHERE id = '" + req.query.id + "';";
            connection.query(sql, function (err, result, fields) {
                if (err) throw err;
                for (let i = 0; i < result.length; i++) {
                    const date = new Date(result[i].date_receiving_vaccine);
                    result[i].date_receiving_vaccine = date.toLocaleDateString('en-CA');
                }
                res.send(result);
            });
        });
    }

//vaccination_details:function to retrieve data from the table of vaccine details with the key that is id
    function addVaccinationDetails(req, res, next) {
        const checkQuery = `SELECT COUNT(*) as count FROM users WHERE id = ${mysql.escape(req.query.id)}`;
        connection.query(checkQuery, (error, results) => {
            if (error) {throw error;}
            else {
                const count = results[0].count;
                if (count === 0) {
                    res.send('User is not registered in the users table.');
                } else {
                    const checkVaccineQuery = `SELECT COUNT(*) as count FROM vaccination_details WHERE id = ${mysql.escape(req.query.id)}`;
                    connection.query(checkVaccineQuery, (err, result) => {
                        if (err) {throw err;}
                        else {
                            const vaccineCount = result[0].count;
                            if (vaccineCount >= 4) {
                                res.send('User has already registered 4 times in the vaccination_details table.');
                            } else {
                                const insertQuery = `INSERT INTO vaccination_details VALUES (${mysql.escape(req.query.id)}, "${req.query.date_receiving_vaccine}", "${req.query.type_vaccine}")`;
                                connection.query(insertQuery, (err, result) => {
                                    if (err) {throw err;
                                    } else {
                                        res.send('Vaccination details added successfully.');
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
    };

//function that retrieves all patients from the three tables by entering the patient's ID
    function getPatientData(req, res, next) {
        connection.connect(function(err) {
            if (err) throw err;
            var userId = req.query.id;
            var sql = `
     SELECT u.id, u.first_name, u.last_name, u.city, u.street, u.house_number, 
             DATE_FORMAT(u.dob, '%Y-%m-%d') AS dob, u.telephone, u.mobile_phone,
             DATE_FORMAT(cr.date_positive_result, '%Y-%m-%d') AS date_positive_result, 
             DATE_FORMAT(cr.date_recovery, '%Y-%m-%d') AS date_recovery
      FROM users u
      LEFT JOIN corona_results_dates cr ON u.id = cr.id
      WHERE u.id = '${userId}'
    `;
            connection.query(sql, function (err, result, fields) {
                if (err) throw err;
                if (result.length > 0) {
                    const user = result[0];
                    const dobDate = new Date(user.dob);
                    user.dob = dobDate.toLocaleDateString('en-CA');
                    const positiveResultDate = new Date(user.date_positive_result);
                    user.date_positive_result = positiveResultDate.toLocaleDateString('en-CA');
                    const recoveryDate = new Date(user.date_recovery);
                    user.date_recovery = recoveryDate.toLocaleDateString('en-CA');
                    var sqlVaccinations = `
         SELECT DATE_FORMAT(vd.date_receiving_vaccine, '%Y-%m-%d') AS date_receiving_vaccine, vd.type_vaccine
          FROM vaccination_details vd
          WHERE vd.id = '${userId}'
        `;
                    connection.query(sqlVaccinations, function (err, result, fields) {
                        if (err) throw err;
                        const vaccinations = result.map(entry => ({
                            date: new Date(entry.date_receiving_vaccine).toLocaleDateString('en-CA'),
                            type: entry.type_vaccine
                        }));
                        user.vaccinations = vaccinations;
                        res.send(user);
                    });
                } else {res.send({});
                }
            });
        });
    }


// Bonus:function that returns the number of active patients in the last month for each day of the month
// (The function checks according to the current month and year)
    function getActivePatientsByMonth(req, res, next) {
        const currentDate = new Date();
        currentDate.setMonth(currentDate.getMonth() - 1);
        const monthNumber = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        const sql = `SELECT COUNT(*) AS active_patients, DAY(date_positive_result) AS day_of_month
               FROM corona_results_dates
               WHERE YEAR(date_positive_result) = ${year} AND MONTH(date_positive_result) = ${monthNumber}
               GROUP BY DAY(date_positive_result);`;
        connection.query(sql, function (err, result, fields) {
            if (err) throw err;
            res.send(result);
        });
    }

//function that checks how many coop members are not vaccinated at all
    function getUnvaccinatedUsersCount(req, res, next) {
        const sql = `SELECT COUNT(*) AS unvaccinated_count FROM users
               WHERE id NOT IN (SELECT DISTINCT id FROM vaccination_details)`;
        connection.query(sql, function (err, result) {
            if (err) throw err;
            const unvaccinatedCount = result[0].unvaccinated_count;
            res.send(`Number of unvaccinated users: ${unvaccinatedCount}`);
        });
    }

    return {getPatient: getPatient,
        addPatient:addPatient,
        getCoronaResultsDates:getCoronaResultsDates,
        addCoronaResultsDates:addCoronaResultsDates,
        getVaccinationDetails:getVaccinationDetails,
        addVaccinationDetails:addVaccinationDetails,
        getActivePatientsByMonth:getActivePatientsByMonth,
        getUnvaccinatedUsersCount:getUnvaccinatedUsersCount,
        getPatientData:getPatientData
    };
})()





