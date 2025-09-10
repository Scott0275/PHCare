/* patientsLambda - CRUD for DynamoDB Patients table */

const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.STORAGE_PATIENTS_NAME;

exports.handler = async (event) => {
  console.log("Request event: ", event);

  const method = event.httpMethod;
  const path = event.resource;
  const id = event.pathParameters ? event.pathParameters.id : null;
  let body;

  try {
    switch (method) {
      case "GET":
        if (id) {
          // GET /patients/{id}
          body = await docClient.get({
            TableName: TABLE_NAME,
            Key: { PatientID: id }
          }).promise();
          body = body.Item || {};
        } else {
          // GET /patients
          body = await docClient.scan({ TableName: TABLE_NAME }).promise();
          body = body.Items;
        }
        break;

      case "POST":
        // POST /patients
        const patient = JSON.parse(event.body);
        if (!patient.PatientID) {
          return response(400, { error: "PatientID is required" });
        }
        await docClient.put({
          TableName: TABLE_NAME,
          Item: patient
        }).promise();
        body = patient;
        break;

      case "PUT":
        // PUT /patients/{id}
        if (!id) return response(400, { error: "PatientID path param is required" });
        const update = JSON.parse(event.body);
        update.PatientID = id;
        await docClient.put({
          TableName: TABLE_NAME,
          Item: update
        }).promise();
        body = update;
        break;

      case "DELETE":
        // DELETE /patients/{id}
        if (!id) return response(400, { error: "PatientID path param is required" });
        await docClient.delete({
          TableName: TABLE_NAME,
          Key: { PatientID: id }
        }).promise();
        body = { deleted: id };
        break;

      default:
        return response(405, { error: `Unsupported method "${method}"` });
    }
    return response(200, body);

  } catch (err) {
    console.error("Error: ", err);
    return response(500, { error: err.message });
  }
};

function response(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  };
}
