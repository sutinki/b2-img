// controller/Auth.js
const path = require('path');
const { requestAuth } = require(path.join(process.cwd(), "common", "axios"));

const getAuth = async (req, res) => {
    try {
        const { applicationKeyId, applicationKey } = req.body;

        const authResponse = await requestAuth({
            url: 'https://api.backblazeb2.com/b2api/v3/b2_authorize_account',
            method: 'post',
            headers: { 'Authorization': 'Basic ' + Buffer.from(`${applicationKeyId}:${applicationKey}`).toString('base64') },
            data: {}
        });

        const uploadUrlResponse = await requestAuth({
            url: `${authResponse.apiInfo.storageApi.apiUrl}/b2api/v3/b2_get_upload_url`,
            method: 'get',
            headers: { 'Authorization': authResponse.authorizationToken },
            params: { bucketId: authResponse.apiInfo.storageApi.bucketId }
        });

        sendJson(res, 200, "登录成功！", { uploadInfo: uploadUrlResponse, authInfo: authResponse });
    } catch (error) {
        console.error('Authentication error:', error);
        sendJson(res, error.response?.status || 500, "登录失败", { message: error.message });
    }
};

module.exports = { getAuth };
