// GoogleDriveUploader.js
import { gapi } from "gapi-script";

const CLIENT_ID = "781857687648-5bv6v1ccv5imsf7406gf3db9tq5mofe1.apps.googleusercontent.com";
const API_KEY = ""; // Optional for now
const SCOPES = "https://www.googleapis.com/auth/drive.file";

let isSignedIn = false;

export const initGapi = () =>
    new Promise((resolve, reject) => {
        gapi.load("client:auth2", async () => {
            try {
                await gapi.client.init({
                    apiKey: API_KEY,
                    clientId: CLIENT_ID,
                    scope: SCOPES,
                    discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
                });

                const authInstance = gapi.auth2.getAuthInstance();
                if (!authInstance.isSignedIn.get()) {
                    await authInstance.signIn();
                }

                isSignedIn = true;
                resolve(true);
            } catch (err) {
                console.error("GAPI Init Error:", err);
                reject(err);
            }
        });
    });

export const uploadFileToDrive = async (file, expenseDate, category, person) => {
    if (!isSignedIn) await initGapi();

    const year = expenseDate.substring(0, 4);
    const month = new Date(expenseDate).toLocaleString("default", { month: "long" });

    const rootFolderName = "DSK OneDesk";
    const path = ["Expenses", "Invoices", year, month];

    // Create folders recursively
    const getOrCreateFolder = async (name, parent) => {
        const response = await gapi.client.drive.files.list({
            q: `'${parent}' in parents and name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
            fields: "files(id, name)",
        });

        if (response.result.files.length > 0) {
            return response.result.files[0].id;
        }

        const folder = await gapi.client.drive.files.create({
            resource: {
                name,
                mimeType: "application/vnd.google-apps.folder",
                parents: [parent],
            },
            fields: "id",
        });

        return folder.result.id;
    };

    // Get root folder
    let parentId = "root";
    for (const folder of [rootFolderName, ...path]) {
        parentId = await getOrCreateFolder(folder, parentId);
    }

    const formattedDate = expenseDate.replace(/-/g, "");
    const filename = `${formattedDate}_${category}_${person.replace(/\s+/g, "_")}.pdf`;

    const metadata = {
        name: filename,
        mimeType: file.type,
        parents: [parentId],
    };

    const reader = new FileReader();
    return new Promise((resolve, reject) => {
        reader.onload = async (e) => {
            const fileData = new Uint8Array(e.target.result);

            try {
                const res = await gapi.client.request({
                    path: "/upload/drive/v3/files",
                    method: "POST",
                    params: {
                        uploadType: "multipart",
                    },
                    headers: {
                        "Content-Type": "multipart/related; boundary=xxx",
                    },
                    body: buildMultipartBody(metadata, fileData),
                });

                const fileId = res.result.id;

                // Make public
                await gapi.client.drive.permissions.create({
                    fileId,
                    resource: {
                        role: "reader",
                        type: "anyone",
                    },
                });

                const fileUrl = `https://drive.google.com/file/d/${fileId}/view`;
                resolve(fileUrl);
            } catch (err) {
                console.error("Upload failed:", err);
                reject(err);
            }
        };

        reader.readAsArrayBuffer(file);
    });
};

const buildMultipartBody = (metadata, fileData) => {
    const boundary = "xxx";
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const meta = JSON.stringify(metadata);
    const body = [
        delimiter,
        'Content-Type: application/json; charset=UTF-8\r\n\r\n',
        meta,
        delimiter,
        `Content-Type: ${metadata.mimeType}\r\n\r\n`,
        new Blob([fileData]),
        closeDelimiter,
    ];

    return new Blob(body, { type: "multipart/related; boundary=" + boundary });
};
