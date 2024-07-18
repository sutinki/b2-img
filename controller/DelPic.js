// controller/DelPic.js
const path = require('path');
const { requestAuth } = require(path.join(process.cwd(), "common", "axios"));

const getDelPic = async (req, res) => {
    try {
        const { apiUrl, fileName, fileId } = req.body;
        const authorization = req.headers.authorization;

        if (!fileName || !fileId || !authorization) {
            throw new Error('Missing required parameters');
        }

        const response = await requestAuth({
            url: `${apiUrl}/b2api/v3/b2_delete_file_version`,
            method: 'post',
            headers: { 'Authorization': authorization },
            data: { fileName, fileId }
        });

        sendJson(res, 200, "删除成功", response);

    } catch (error) {
        console.error('Error in getDelPic:', error);
        sendJson(res, error.response?.status || 500, "删除失败", { message: error.message });
    }
};

module.exports = {
    getDelPic
};
