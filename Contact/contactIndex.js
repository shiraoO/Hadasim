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
   //users:
    /**
     * Retrieves patient data from the database based on the provided user ID.
     * @param {object} req - The request object.
     * @param {object} res - The response object.
     * @param {function} next - The next middleware function.
     */
    function getPatient(req, res, next) {
        // Establish a connection to the database
        connection.connect(function(err) {
            if (err) throw err;
            // Create the SQL query to select the user data based on the provided user ID
            var sql = "SELECT * FROM users WHERE id = '" + req.query.id + "';";
            // Execute the SQL query
            connection.query(sql, function (err, result, fields) {
                if (err) throw err;
                // Format the date of birth (dob) field for each user in the result
                for (let i = 0; i < result.length; i++) {
                    const date = new Date(result[i].dob);
                    result[i].dob = date.toLocaleDateString('en-CA');
                }
                // Send the formatted result as the response
                res.send(result);
            });
        });
    }

    /**
     * Adds a new patient to the database based on the provided user data.
     */
    function addPatient(req, res, next) {
        // Create a query to check if the user already exists in the database
        const checkQuery = `SELECT COUNT(*) as count FROM users WHERE id = ${mysql.escape(req.query.id)}`;
        // Execute the check query
        connection.query(checkQuery, function (error, results) {
            if (error) throw error;
            // Get the count of rows returned by the check query
            const count = results[0].count;
            // If the user does not exist, insert the user data into the database
            if (count === 0) {
                // Create the insert query to add the user to the database
                const insertQuery = `INSERT INTO users VALUES (${mysql.escape(req.query.id)}, ${mysql.escape(req.query.first_name)}, ${mysql.escape(req.query.last_name)},
        ${mysql.escape(req.query.city)}, ${mysql.escape(req.query.street)}, ${req.query.house_number}, ${mysql.escape(req.query.dob)}, ${req.query.telephone}, ${req.query.mobile_phone})`;
                // Execute the insert query
                connection.query(insertQuery, function (err, result) {
                    if (err) throw err;
                    res.send('User registered successfully.');
                });
            } else {
                // If the user already exists, send a response indicating so
                res.send('User already exists.');
            }
        });
    }
    /**
     * Retrieves the corona results dates for a specific user from the database.
     */
    function getCoronaResultsDates(req, res, next) {
        // Establish a connection to the database
        connection.connect(function(err) {
            if (err) throw err;
            // Create the SQL query to retrieve the corona results dates for the specified user
            var sql = "SELECT * FROM corona_results_dates WHERE id = '" + req.query.id + "';";
            // Execute the SQL query
            connection.query(sql, function (err, result, fields) {
                if (err) throw err;
                // Format the date fields in the result
                for (let i = 0; i < result.length; i++) {
                    const datePositiveResult = new Date(result[i].date_positive_result);
                    result[i].date_positive_result = datePositiveResult.toLocaleDateString('en-CA');
                    const dateRecovery = new Date(result[i].date_recovery);
                    result[i].date_recovery = dateRecovery.toLocaleDateString('en-CA');
                }
                // Send the formatted result as the response
                res.send(result);
            });
        });
    }

    /**
     * Adds corona results dates for a specific user to the corona_results_dates table in the database.
     */
    function addCoronaResultsDates(req, res, next) {
        // Check if the user exists in the users table
        const checkUserQuery = `SELECT COUNT(*) as count FROM users WHERE id = ${mysql.escape(req.query.id)}`;
        connection.query(checkUserQuery, (error, userResults) => {
            if (error) throw error;
            const userCount = userResults[0].count;
            if (userCount === 0) {
                res.send('User is not registered in the users table.');
            } else {
                // Check if corona results dates already exist for the user
                const checkQuery = `SELECT COUNT(*) as count FROM corona_results_dates WHERE id = ${mysql.escape(req.query.id)}`;
                connection.query(checkQuery, (error, results) => {
                    if (error) throw error;
                    const count = results[0].count;
                    if (count > 0) {
                        res.send('User is already registered in the corona results dates.');
                    } else {
                        // Add corona results dates for the user
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
    /**
     * Retrieves vaccination details for a specific user from the vaccination_details table in the database.
     */
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
    /**
     * Adds vaccination details for a specific user to the vaccination_details table in the database.
     */
    function addVaccinationDetails(req, res, next) {
        // Check if the user is registered in the users table
        const checkQuery = `SELECT COUNT(*) as count FROM users WHERE id = ${mysql.escape(req.query.id)}`;
        connection.query(checkQuery, (error, results) => {
            if (error) {throw error;}
            else {
                const count = results[0].count;
                if (count === 0) {
                    res.send('User is not registered in the users table.');
                } else {
                    // Check the count of existing vaccination details for the user
                    const checkVaccineQuery = `SELECT COUNT(*) as count FROM vaccination_details WHERE id = ${mysql.escape(req.query.id)}`;
                    connection.query(checkVaccineQuery, (err, result) => {
                        if (err) {throw err;}
                        else {
                            const vaccineCount = result[0].count;
                            if (vaccineCount >= 4) {
                                res.send('User has already registered 4 times in the vaccination_details table.');
                            } else {
                                // Insert the vaccination details for the user
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
    }
    /**
     * Retrieves patient data from the users, corona_results_dates, and vaccination_details tables by entering the patient's ID.
     * @throws {Error} - If there is an error in the database connection or query execution.
     */
    function getPatientData(req, res, next) {
        connection.connect(function(err) {
            if (err) {throw err;}
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
                if (err) {throw err;}
                if (result.length > 0) {
                    const user = result[0];
                    const dobDate = new Date(user.dob);
                    user.dob = dobDate.toLocaleDateString('en-CA');
                    const positiveResultDate = result[0].date_positive_result;
                    user.date_positive_result = positiveResultDate ? new Date(positiveResultDate).toLocaleDateString('en-CA') : '';
                    const recoveryDate = result[0].date_recovery;
                    user.date_recovery = recoveryDate ? new Date(recoveryDate).toLocaleDateString('en-CA') : '';
                    var sqlVaccinations = `
          SELECT DATE_FORMAT(vd.date_receiving_vaccine, '%Y-%m-%d') AS date_receiving_vaccine, vd.type_vaccine
          FROM vaccination_details vd
          WHERE vd.id = '${userId}'
        `;
                    connection.query(sqlVaccinations, function (err, result, fields) {
                        if (err) {throw err;}
                        const vaccinations = result.map(entry => ({
                            date: new Date(entry.date_receiving_vaccine).toLocaleDateString('en-CA'),
                            type: entry.type_vaccine
                        }));
                        user.vaccinations = vaccinations;
                        res.send(user);
                    });
                } else {res.send({});}
            });
        });
    }

    /**
     * Retrieves the count of active patients by day for the previous month based on the date_positive_result from the corona_results_dates table.
     */
    function getNumberPatientsEachDayLastMonth(req, res, next) {
        const currentDate = new Date();
        currentDate.setMonth(currentDate.getMonth() - 1);
        const monthNumber = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        const sql = `SELECT COUNT(*) AS active_patients, DAY(date_positive_result) AS day_of_month
               FROM corona_results_dates
               WHERE YEAR(date_positive_result) = ${year} AND MONTH(date_positive_result) = ${monthNumber}
               GROUP BY DAY(date_positive_result);`;
        connection.query(sql, function (err, result, fields) {
            if (err) {
                throw err;
            }
            res.send(result);
        });
    }

    /**
     * Retrieves the count of unvaccinated users by checking the users who do not have records in the vaccination_details table.
     */
    function getUnvaccinatedUsersCount(req, res, next) {
        const sql = `SELECT COUNT(*) AS unvaccinated_count FROM users
               WHERE id NOT IN (SELECT DISTINCT id FROM vaccination_details)`;
        connection.query(sql, function (err, result) {
            if (err) {
                throw err;
            }
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
        getNumberPatientsEachDayLastMonth:getNumberPatientsEachDayLastMonth,
        getUnvaccinatedUsersCount:getUnvaccinatedUsersCount,
        getPatientData:getPatientData
    };
})()





