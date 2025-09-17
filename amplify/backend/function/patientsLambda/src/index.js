/* patientsLambda - Handles Patient CRUD via API Gateway proxy integration */

const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();
const crypto = require("crypto");

const TABLE_NAME = process.env.STORAGE_PATIENTS_NAME;

exports.handler = async (event) => {
  console.log("EVENT:", JSON.stringify(event, null, 2));

  const method = event.httpMethod;
  const pathParams = event.pathParameters || {};
  const queryStringParameters = event.queryStringParameters || {};
  const body = event.body && event.body.trim() !== '' ? JSON.parse(event.body) : {};
  const userGroups =
    event.requestContext.authorizer?.claims["cognito:groups"] || [];

  try {
    // Security Check: Enforce role-based access
    const isDoctor = userGroups.includes("Doctor");
    const isStaff = userGroups.includes("Staff");
    const isWriteMethod = ["POST", "PUT", "DELETE"].includes(method);

    if (isWriteMethod && !isDoctor) {
      console.log(`[SECURITY] Denied ${method} request from user. Not in 'Doctor' group. Groups: ${JSON.stringify(userGroups)}`);
      return response(403, {
        error: "Forbidden: You do not have permission to perform this action.",
      });
    }

    // NEW: Handle document upload route: POST /patients/{id}/documents
    const proxyPath = pathParams.proxy || '';
    const pathSegments = proxyPath.split('/');
    if (method === "POST" && pathSegments.length === 2 && pathSegments[1] === 'documents') {
      const patientId = pathSegments[0];

      if (!isDoctor) {
        return response(403, { error: "Forbidden: Only doctors can generate upload links." });
      }

      if (!body.fileName || !body.fileType) {
        return response(400, { error: "Missing fileName or fileType in request body." });
      }

      const documentId = crypto.randomUUID();
      const sanitizedFileName = body.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const s3Key = `private/${patientId}/${documentId}-${sanitizedFileName}`;

      const s3 = new AWS.S3();
      const params = {
        Bucket: process.env.STORAGE_EHRDOCS_BUCKETNAME,
        Key: s3Key,
        Expires: 300, // URL is valid for 5 minutes
        ContentType: body.fileType,
      };

      const uploadUrl = await s3.getSignedUrlPromise("putObject", params);
      return response(200, { uploadUrl, key: s3Key });
    }

    if (method === "POST" && event.path === "/patients") {
      // Create Patient
      // This check is now covered by the main security check above,
      // but we leave the code here as the logic is sound.
      const item = body;
      await docClient.put({ TableName: TABLE_NAME, Item: item }).promise();
      return response(201, { message: "Patient created", item });
    }

    if (method === "GET" && event.path === "/patients") {
      // List Patients
      const q = queryStringParameters?.q;

      if (q) {
        // Search Patients (by FirstName/LastName)
        const data = await docClient
          .scan({
            TableName: TABLE_NAME,
            FilterExpression: "contains(#fn, :q) OR contains(#ln, :q)",
            ExpressionAttributeNames: { "#fn": "FirstName", "#ln": "LastName" },
            ExpressionAttributeValues: { ":q": q },
          })
          .promise();
        return response(200, data.Items);
      } else {
        // List All Patients
        const data = await docClient.scan({ TableName: TABLE_NAME }).promise();
        return response(200, data.Items);
      }
    }

    // For routes like /patients/{id}, the ID will be in the 'proxy' path parameter.
    // Ensure it's a simple ID and not a multi-segment path for documents.
    const id = (pathParams.proxy && !pathParams.proxy.includes('/')) ? pathParams.proxy : null;

    if (method === "GET" && id) {
      // Get Patient by ID
      const data = await docClient
        .get({ TableName: TABLE_NAME, Key: { PatientID: id } })
        .promise();
      return data.Item
        ? response(200, data.Item)
        : response(404, { error: "Patient not found" });
    }

    if (method === "PUT" && id) {
      // Update Patient
      const updates = { ...body };
      // Prevent primary key from being updated
      if (updates.PatientID) {
        delete updates.PatientID;
      }
      const updateExpr =
        "set " + Object.keys(updates).map((k, i) => `#k${i} = :v${i}`).join(", ");
      const exprAttrNames = Object.keys(updates).reduce(
        (acc, k, i) => ({ ...acc, [`#k${i}`]: k }),
        {}
      );
      const exprAttrValues = Object.keys(updates).reduce(
        (acc, k, i) => ({ ...acc, [`:v${i}`]: updates[k] }),
        {}
      );

      await docClient
        .update({
          TableName: TABLE_NAME,
          Key: { PatientID: id },
          UpdateExpression: updateExpr,
          ExpressionAttributeNames: exprAttrNames,
          ExpressionAttributeValues: exprAttrValues,
        })
        .promise();

      return response(200, { message: "Patient updated" });
    }

    if (method === "DELETE" && id) {
      // Delete Patient
      await docClient
        .delete({ TableName: TABLE_NAME, Key: { PatientID: id } })
        .promise();
      return response(200, { message: "Patient deleted" });
    }

    return response(400, { error: "Unsupported route" });
  } catch (err) {
    console.error("Error:", err);
    return response(500, { error: err.message });
  }
};

// Helper: format Lambda proxy response
function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
    },
    body: JSON.stringify(body),
  };
}
