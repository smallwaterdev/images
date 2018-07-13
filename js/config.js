const smallData_ip = "localhost";
const smallData_user_port = 3000;
const smallData_store_port = 3001;
const smallData_secure_store_port = smallData_store_port + 443;

const smallData_secure_store_private_key_path = '/secure_servers/smallData_manage/private.key';
const smallData_secure_store_certificate_path = '/secure_servers/smallData_manage/certificate.pem';

const mongodb_url = "mongodb://localhost:27017/smallwater";
const mongodb_auth = {
    auth:{authdb:"admin"},
    user:"store",
    pass:"xyz123"
}

const manage_token = "store_password";
module.exports.smallData_ip = smallData_ip;
module.exports.smallData_user_port = smallData_user_port;
module.exports.smallData_store_port = smallData_store_port;
module.exports.smallData_secure_store_port = smallData_secure_store_port;

module.exports.smallData_secure_store_private_key_path = smallData_secure_store_private_key_path;
module.exports.smallData_secure_store_certificate_path = smallData_secure_store_certificate_path;

module.exports.mongodb_url = mongodb_url;
module.exports.manage_token = manage_token;