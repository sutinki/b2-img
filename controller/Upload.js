// controller/Upload.js
const path = require('path');
const { requestAuth } = require(path.join(process.cwd(), "common", "axios"));
const crypto = require('crypto')
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const getUpload = async (req, res) => {
    try {
        if (!req.file) {
            throw new Error('No file uploaded');
        }

        const {
            'x-bz-info-uploadurl': uploadUrl,
            authorization,
            suffix
        } = req.headers;

        if (!uploadUrl || !authorization || !suffix) {
            throw new Error('Missing required headers');
        }

        // 生成日期字符串
        const date = new Date();
        const dateString = `${date.getFullYear().toString().slice(-2)}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;

        // 计算文件哈希
        const hash = crypto.createHash('sha1').update(req.file.buffer).digest('hex');
        const shorthash = hash.substring(0, 8) + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        
        // 添加转换规则
        const suffixMap = {
            'x-icon': 'ico',
            'jpeg': 'jpg',
            'javascript': 'js',
            'svg+xml': 'svg'
        };

        finalSuffix = suffixMap[suffix.toLowerCase()] || suffix;

        // 组合新的文件名
        const fileName = `${dateString}-${shorthash}.${finalSuffix}`;

        console.log(fileName)
        const response = await requestAuth({
            url: uploadUrl,
            method: 'post',
            headers: {
                'Authorization': authorization,
                'X-Bz-File-Name': fileName,
                'Content-Type': "b2/x-auto",
                'X-Bz-Content-Sha1': 'do_not_verify', // 使用计算的哈希值
                'X-Bz-Info-Author': 'unknown',
                'X-Bz-Server-Side-Encryption': 'AES256'
            },
            data: req.file.buffer
        });

        sendJson(res, 200, "上传成功！", response);
    } catch (error) {
        console.error('Error in getUpload:', error);
        sendJson(res, error.response?.status || 500, "上传失败", { message: error.message });
    }
};

module.exports = {
    getUpload,
    upload
};