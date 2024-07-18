// controller/ImgList.js
const path = require('path');
const { requestAuth } = require(path.join(process.cwd(), "common", "axios"));

const getImgList = async (req, res) => {
    try {
        const { apiUrl, bucketId, startFileName, prefix } = req.body;
        const authorization = req.headers.authorization;

        if (!apiUrl || !bucketId || !authorization) {
            throw new Error('Missing required parameters');
        }

        // 优化参数构建
        const params = {
            bucketId,
            ...(startFileName && startFileName.trim() && { startFileName }),
            ...(prefix && prefix.trim() && { prefix })
        };

        const response = await requestAuth({
            url: `${apiUrl}/b2api/v3/b2_list_file_names`,
            method: 'get',
            headers: { 'Authorization': authorization },
            params: params
        });

        sendJson(res, 200, "获取列表成功", response);
    } catch (error) {
        console.error('Error in getImgList:', error);
        sendJson(res, error.response?.status || 500, "获取列表失败", { message: error.message });
    }
};


module.exports = {
    getImgList
};
